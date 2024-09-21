import asyncio
import io
import sys
from datetime import datetime, timezone

from config import SEASON
from database import get_events
from game_updater import run_game_update
from odds_updater import run_odds_update
from season_simulation_updater import run_season_simulation
from team_record_updater import run_team_record_update
from update_queues import (
    GAME_UPDATE_QUEUE,
    ODDS_UPDATE_QUEUE,
    SEASON_SIMULATION_QUEUE,
    TEAM_RECORD_UPDATE_QUEUE,
    load_update_queue,
)

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, line_buffering=True)


async def process_queue(queue, update_func):
    print(f"Starting {update_func.__name__} queue processing", flush=True)
    while True:
        now = datetime.now(timezone.utc)
        next_event = queue.peek()

        if next_event and next_event.val < now:
            item = queue.pop()
            next_update = await update_func(item.key)

            print(
                f"[{update_func.__name__}] Updated event {item.key if item.key != '' else ''} : next update {next_update}"
            )

            if next_update:
                queue.add(item.key, next_update)
        await asyncio.sleep(1)


async def main():

    all_events = get_events(SEASON)

    load_update_queue(all_events)

    odds_task = asyncio.create_task(process_queue(ODDS_UPDATE_QUEUE, run_odds_update))
    game_task = asyncio.create_task(process_queue(GAME_UPDATE_QUEUE, run_game_update))
    team_record_task = asyncio.create_task(
        process_queue(TEAM_RECORD_UPDATE_QUEUE, run_team_record_update)
    )
    season_simulation_task = asyncio.create_task(
        process_queue(SEASON_SIMULATION_QUEUE, run_season_simulation)
    )
    await asyncio.gather(game_task, odds_task, team_record_task, season_simulation_task)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        print(f"An error occurred: {e}", flush=True)
        raise
