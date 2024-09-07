import asyncio
from datetime import datetime, timezone

from config import SEASON
from database import get_events
from game_updater import run_game_update
from odds_updater import run_odds_update
from update_queues import GAME_UPDATE_QUEUE, ODDS_UPDATE_QUEUE, load_update_queue


async def process_queue(queue, update_func):
    while True:
        now = datetime.now(timezone.utc)
        next_event = queue.peek()

        if next_event and next_event.val < now:
            item = queue.pop()
            next_update = await update_func(item.key)

            print(
                f"[{update_func.__name__}] Updated event {item.key if item.key != '' else 'GAMES'} : next update {next_update}"
            )

            if next_update:
                queue.add(item.key, next_update)
        await asyncio.sleep(1)


async def main():

    # get all events

    all_events = get_events(SEASON)

    load_update_queue(all_events)

    odds_task = (
        None  # asyncio.create_task(process_queue(ODDS_UPDATE_QUEUE, run_odds_update))
    )
    game_task = asyncio.create_task(process_queue(GAME_UPDATE_QUEUE, run_game_update))

    await asyncio.gather(game_task)


if __name__ == "__main__":
    asyncio.run(main())
