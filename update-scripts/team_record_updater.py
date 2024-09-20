from datetime import datetime, timedelta
from typing import Optional

from config import SEASON
from database import get_events
from db import pool


def run_team_record_update(*args) -> Optional[datetime]:

    now = datetime.now()

    events = get_events(SEASON)

    # filter for completed events
    completed_events = [event for event in events if event.completed]

    # get team records

    records = {}

    for event in completed_events:
        if event.home_team_id not in records:
            records[event.home_team_id] = {"wins": 0, "losses": 0, "ties": 0}
        if event.away_team_id not in records:
            records[event.away_team_id] = {"wins": 0, "losses": 0, "ties": 0}

        home_score = event.home_score if event.home_score else 0
        away_score = event.away_score if event.away_score else 0

        if home_score > away_score:
            records[event.home_team_id]["wins"] += 1
            records[event.away_team_id]["losses"] += 1
        elif home_score < away_score:
            records[event.home_team_id]["losses"] += 1
            records[event.away_team_id]["wins"] += 1
        else:
            records[event.home_team_id]["ties"] += 1
            records[event.away_team_id]["ties"] += 1

    conn = pool.getconn()
    try:
        with conn.cursor() as cursor:
            for team_id, record in records.items():
                cursor.execute(
                    """UPDATE teams 
                    SET wins = %s, 
                        losses = %s, 
                        ties = %s 
                    WHERE id = %s""",
                    (
                        record["wins"],
                        record["losses"],
                        record["ties"],
                        team_id,
                    ),
                )
        conn.commit()
    finally:
        pool.putconn(conn)

    return now + timedelta(minutes=5)
