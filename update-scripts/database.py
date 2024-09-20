from typing import List, Optional

from db import pool
from models import Event, EventOdds
from psycopg2.extras import RealDictCursor


def get_events(season: str) -> List[Event]:
    events: List[Event] = []
    conn = pool.getconn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT * FROM events WHERE season = %s", (season,))
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
                events.append(new_event)
    finally:
        pool.putconn(conn)

    events = sorted(events, key=lambda x: x.commence_time)

    return events


def get_event(event_id: str) -> Optional[Event]:
    conn = pool.getconn()
    ret_event = None
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT * FROM events WHERE id = %s", (event_id,))
            event = cursor.fetchone()
            if event:
                ret_event = Event(
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
    finally:
        pool.putconn(conn)
    return ret_event


def update_events(events: List[Event]):

    # updating commence time, completed, home_score, away_score, last_updated

    conn = pool.getconn()
    try:
        with conn.cursor() as cursor:
            for event in events:

                cursor.execute(
                    """UPDATE events 
                    SET commence_time = %s, 
                        completed = %s, 
                        home_score = %s, 
                        away_score = %s, 
                        last_updated = %s 
                    WHERE id = %s""",
                    (
                        event.commence_time,
                        event.completed,
                        event.home_score,
                        event.away_score,
                        event.last_updated,
                        event.id,
                    ),
                )
        conn.commit()
    finally:
        pool.putconn(conn)


def insert_event_odds(odds: EventOdds):
    conn = pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO event_odds (id, event_id, timestamp, home_odds, away_odds, sportsbook_key) "
                "VALUES (%s, %s, %s, %s, %s, %s)",
                (
                    odds.id,
                    odds.event_id,
                    odds.timestamp,
                    odds.home_odds,
                    odds.away_odds,
                    odds.sportbook_key,
                ),
            )
        conn.commit()
    finally:
        pool.putconn(conn)
