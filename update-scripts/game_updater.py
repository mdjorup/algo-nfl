from datetime import datetime, timedelta, timezone
from typing import Optional

from api_client import get_game_status
from config import SEASON
from database import get_events, update_events


async def run_game_update(*args) -> Optional[datetime]:
    # Add logic to update game data
    # game = get_game_api_event_data(event_id)
    # if game:
    #     return game.commence_time

    upcoming_events = get_events(SEASON)

    sorted_events = sorted(upcoming_events, key=lambda x: x.commence_time)

    # filter out completed events
    upcoming_events = list(filter(lambda x: not x.completed, sorted_events))

    now = datetime.now(tz=timezone.utc)
    if len(upcoming_events) == 0:
        return now + timedelta(days=1)

    next_event = upcoming_events[0]

    # if we're before the next event, update in 1 day or when the event starts
    if now < next_event.commence_time:
        next_update = min(now + timedelta(days=1), next_event.commence_time)
        game_updates = get_game_status()
    else:
        next_update = now + timedelta(minutes=5)
        game_updates = get_game_status(days_from=1)

    events_to_update = []

    for ue in upcoming_events:
        for gu in game_updates:
            if ue.id == gu.id:
                events_to_update.append(gu)
                continue

    update_events(events_to_update)

    return next_update
