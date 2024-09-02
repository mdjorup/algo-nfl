import os
import time
from datetime import datetime, timedelta, timezone
from typing import Dict, List
from uuid import uuid4

import requests
from datatypes import Event, EventOdds
from db import pool
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor
from utils import RunningAverage

load_dotenv()

SEASON = os.getenv("SEASON", "2024")

NOW = datetime.now(timezone.utc)  # Make NOW offset-aware
ODDS_API_KEY = os.getenv("ODDS_API_KEY")


def get_events_to_update_odds() -> List[Event]:

    events: List[Event] = []
    latest_event_odds: Dict[str, EventOdds] = {}

    conn = pool.getconn()

    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(
            """SELECT DISTINCT ON (event_id) * FROM public.event_odds ORDER BY event_id, "timestamp" DESC;"""
        )

        event_odds = cursor.fetchall()

        for eo in event_odds:
            latest_event_odds[eo["event_id"]] = EventOdds(
                eo["id"],
                eo["event_id"],
                eo["timestamp"],
                eo["home_odds"],
                eo["away_odds"],
            )

        cursor.execute("SELECT * FROM events WHERE season = %s", (SEASON,))

        events_raw = cursor.fetchall()

        for event in events_raw:

            new_event = Event(
                event["id"],
                event["last_updated"],
                event["season"],
                event["home_team_id"],
                event["away_team_id"],
                event["commence_time"],
                event["completed"],
                event["home_score"],
                event["away_score"],
            )

            # if the event is completed, we don't need to update odds
            if new_event.completed or new_event.commence_time < NOW + timedelta(
                hours=4
            ):
                continue

            event_latest_odds = latest_event_odds.get(new_event.id)

            # if the event has no odds, automatically update odds

            if not event_latest_odds:
                events.append(new_event)
                continue

            # if the event is happening in the next week, automatically update odds
            if new_event.commence_time < NOW + timedelta(
                days=7
            ) and event_latest_odds.timestamp < NOW - timedelta(hours=1):
                events.append(new_event)
                continue

            # if the latest event odds are more than 24 hours old, update odds
            if event_latest_odds.timestamp <= NOW - timedelta(hours=24):
                events.append(new_event)

    pool.putconn(conn)

    return events


def get_odds_api_event_odds(event_id: str) -> EventOdds | None:

    sport = "americanfootball_nfl"

    markets = "h2h"
    regions = "us"
    odds_format = "decimal"

    endpoint = f"https://api.the-odds-api.com/v4/sports/{sport}/events/{event_id}/odds?apiKey={ODDS_API_KEY}&regions={regions}&markets={markets}&oddsFormat={odds_format}"

    response = requests.get(endpoint)

    # make the request
    if response.status_code == 429:
        time.sleep(5)
        response = requests.get(endpoint)

    if response.status_code != 200:
        return None

    data = response.json()

    home_name = data["home_team"]
    away_name = data["away_team"]

    timestamp = datetime.now(tz=timezone.utc)

    home_avg = RunningAverage()
    away_avg = RunningAverage()

    for bookmaker in data.get("bookmakers", []):
        markets = bookmaker.get("markets", [])
        for market in markets:
            if market["key"] != "h2h":
                continue

            outcomes = market.get("outcomes", [])

            for outcome in outcomes:
                if outcome["name"] == home_name:
                    home_avg.add(outcome["price"])
                elif outcome["name"] == away_name:
                    away_avg.add(outcome["price"])

    rand_id = uuid4().hex

    return EventOdds(
        id=rand_id,
        event_id=event_id,
        timestamp=timestamp,
        home_odds=home_avg.get_average(),
        away_odds=away_avg.get_average(),
    )


def update_odds():
    events = get_events_to_update_odds()

    conn = pool.getconn()
    for event in events:
        # update odds

        event_id = event.id
        print(f"{datetime.now(tz=timezone.utc)} - Updating odds for event {event_id}")

        event_odds = get_odds_api_event_odds(event_id)

        if not event_odds:
            continue

        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                "INSERT INTO event_odds (id, event_id, timestamp, home_odds, away_odds) VALUES (%s, %s, %s, %s, %s)",
                (
                    event_odds.id,
                    event_odds.event_id,
                    event_odds.timestamp,
                    event_odds.home_odds,
                    event_odds.away_odds,
                ),
            )

    conn.commit()

    pool.putconn(conn)


update_odds()
