import time
from datetime import datetime, timezone
from typing import List
from uuid import uuid4

import requests
from config import ODDS_API_KEY, SEASON
from models import Event, EventOdds


def get_game_status(days_from: int = 0) -> List[Event]:
    endpoint = f"https://api.the-odds-api.com/v4/sports/americanfootball_nfl/scores?apiKey={ODDS_API_KEY}"
    if days_from > 0:
        endpoint += f"&daysFrom={days_from}"

    response = requests.get(endpoint)
    if response.status_code == 429:
        time.sleep(5)
        response = requests.get(endpoint)

    if response.status_code != 200:
        return []

    raw_events = response.json()
    return [parse_odds_api_score(event) for event in raw_events]


def parse_odds_api_score(event: dict) -> Event:
    commence_time = event["commence_time"]

    last_updated = event["last_update"]

    if not last_updated:
        last_updated = datetime.now(tz=timezone.utc)
    home_team = event.get("home_team", "")
    away_team = event.get("away_team", "")

    home_score = None
    away_score = None
    scores = event.get("scores", [])
    if scores:
        for score in event.get("scores", []):
            if score["name"] == home_team:
                home_score = score["score"]
            elif score["name"] == away_team:
                away_score = score["score"]

    return Event(
        id=event["id"],
        last_updated=last_updated,
        season=SEASON,
        home_team_id=home_team,  # NOT ACTUAL ID
        away_team_id=away_team,  # NOT ACTUAL ID
        commence_time=commence_time,
        completed=event.get("completed", False),
        home_score=home_score,
        away_score=away_score,
    )


def get_odds_api_event_odds(event_id: str) -> List[EventOdds]:
    endpoint = f"https://api.the-odds-api.com/v4/sports/americanfootball_nfl/events/{event_id}/odds"

    params = {
        "apiKey": ODDS_API_KEY,
        "regions": "us",
        "markets": "h2h",
        "oddsFormat": "decimal",
    }

    response = requests.get(endpoint, params=params)
    if response.status_code == 429:
        time.sleep(5)
        response = requests.get(endpoint, params=params)

    if response.status_code != 200:
        return []

    data = response.json()
    home_name = data["home_team"]
    away_name = data["away_team"]

    ret_odds = []
    for bookmaker in data.get("bookmakers", []):
        sportsbook_key = bookmaker.get("key")
        for market in bookmaker.get("markets", []):
            if market["key"] != "h2h":
                continue

            last_update = datetime.fromisoformat(
                market.get("last_update", datetime.now(timezone.utc).isoformat())
            )
            home_odds = None
            away_odds = None

            for outcome in market.get("outcomes", []):
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
