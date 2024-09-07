from datetime import datetime, timedelta, timezone
from typing import Optional

from api_client import get_odds_api_event_odds
from database import get_event, insert_event_odds


async def run_odds_update(event_id: str) -> Optional[datetime]:
    event = get_event(event_id)

    if not event:
        return None

    if event.completed:
        return None

    odds = get_odds_api_event_odds(event_id)

    for odd in odds:
        insert_event_odds(odd)

    now = datetime.now(timezone.utc)

    if now < event.commence_time - timedelta(weeks=1):
        print("Game is more than a week away")
        return now + timedelta(days=1)
    elif now < event.commence_time - timedelta(days=1):
        print("Game is more than a day away")
        return now + timedelta(hours=6)
    elif now < event.commence_time - timedelta(minutes=30):
        print("Game is less than a day away")
        return min(
            now + timedelta(hours=1), event.commence_time - timedelta(minutes=30)
        )
    elif now < event.commence_time + timedelta(hours=5):
        print("Game is in progress or about to start")
        return now + timedelta(minutes=5)

    return None
