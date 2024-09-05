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
            if new_event.completed:
                continue

            # if the event is happening in the next week, automatically update odds
            if (
                new_event.commence_time < NOW + timedelta(days=7)
                and new_event.commence_time >= NOW
            ):
                events.append(new_event)

    pool.putconn(conn)

    return events


def get_odds_api_event_odds(event_id: str) -> List[EventOdds]:

    sport = "americanfootball_nfl"

    markets = "h2h"
    regions = "us"
    odds_format = "decimal"

    endpoint = f"https://api.the-odds-api.com/v4/sports/{sport}/events/{event_id}/odds?apiKey={ODDS_API_KEY}&regions={regions}&markets={markets}&oddsFormat={odds_format}"

    response = requests.get(endpoint)

    ret_odds: List[EventOdds] = []

    # make the request
    if response.status_code == 429:
        time.sleep(5)
        response = requests.get(endpoint)

    if response.status_code != 200:
        return []

    data = response.json()

    home_name = data["home_team"]
    away_name = data["away_team"]

    for bookmaker in data.get("bookmakers", []):
        sportsbook_key = bookmaker.get("key")
        markets = bookmaker.get("markets", [])
        for market in markets:
            if market["key"] != "h2h":
                continue

            outcomes = market.get("outcomes", [])
            last_update = market.get("last_update", None)

            if not last_update:
                last_update = datetime.now(timezone.utc)
            else:
                last_update = datetime.fromisoformat(last_update)

            home_odds = None
            away_odds = None

            for outcome in outcomes:
                if outcome["name"] == home_name:
                    home_odds = outcome["price"]
                elif outcome["name"] == away_name:
                    away_odds = outcome["price"]

            if home_odds is not None and away_odds is not None:
                ret_odds.append(
                    EventOdds(
                        id=uuid4().hex,
                        event_id=event_id,
                        timestamp=last_update,
                        home_odds=home_odds,
                        away_odds=away_odds,
                        sportbook_key=sportsbook_key,
                    )
                )
    return ret_odds


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

            for eo in event_odds:

                cursor.execute(
                    "INSERT INTO event_odds (id, event_id, timestamp, home_odds, away_odds, sportsbook_key) VALUES (%s, %s, %s, %s, %s, %s)",
                    (
                        eo.id,
                        eo.event_id,
                        eo.timestamp,
                        eo.home_odds,
                        eo.away_odds,
                        eo.sportbook_key,
                    ),
                )
        time.sleep(0.2)

    conn.commit()

    pool.putconn(conn)


update_odds()
