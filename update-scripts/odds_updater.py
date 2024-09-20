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

    now = datetime.now(timezone.utc)

    if len(odds) == 0:
        return now + timedelta(minutes=5)

    for odd in odds:
        insert_event_odds(odd)

    if now < event.commence_time - timedelta(weeks=1):
        return now + timedelta(days=1)
    elif now < event.commence_time - timedelta(days=1):
        return now + timedelta(hours=6)
    elif now < event.commence_time - timedelta(minutes=30):
        return min(
            now + timedelta(hours=1), event.commence_time - timedelta(minutes=30)
        )
    elif now < event.commence_time + timedelta(hours=5):
        return now + timedelta(minutes=5)

    return None
