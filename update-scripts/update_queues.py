import heapq
import random
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from models import Event


@dataclass
class UpdateQueueValue:
    key: str
    val: datetime

    def __lt__(self, other):
        return self.val < other.val

    def __eq__(self, other):
        return self.val == other.val


class UpdateQueue:
    def __init__(self):
        self.queue: List[UpdateQueueValue] = []

    def clear_queue(self):
        self.queue = []

    def add(self, key: str, val: datetime):
        heapq.heappush(self.queue, UpdateQueueValue(key, val))

    def pop(self) -> UpdateQueueValue:
        return heapq.heappop(self.queue)

    def peek(self) -> Optional[UpdateQueueValue]:
        return self.queue[0] if len(self.queue) > 0 else None

    def __len__(self):
        return len(self.queue)


ODDS_UPDATE_QUEUE = UpdateQueue()
GAME_UPDATE_QUEUE = UpdateQueue()
TEAM_RECORD_UPDATE_QUEUE = UpdateQueue()


def load_update_queue(events: List[Event]):
    now = datetime.now(timezone.utc)

    GAME_UPDATE_QUEUE.add("", now)
    TEAM_RECORD_UPDATE_QUEUE.add("", now)

    for event in events:
        # filter out events that are completed or more than 6 hours old
        if event.completed or now > event.commence_time + timedelta(hours=6):
            continue

        # determine when to update the game
        if now < event.commence_time - timedelta(hours=6):
            random_seconds = random.randint(0, 21600)  # 86400 seconds in a day

            GAME_UPDATE_QUEUE.add(event.id, now + timedelta(seconds=random_seconds))
        else:
            ODDS_UPDATE_QUEUE.add(event.id, now)

    print(f"Finished loading update queues")
