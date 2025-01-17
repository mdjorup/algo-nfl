from dataclasses import dataclass
from datetime import datetime


@dataclass
class Event:
    id: str
    last_updated: datetime
    season: str
    home_team_id: str
    away_team_id: str
    commence_time: datetime
    completed: bool
    home_score: int | None
    away_score: int | None


@dataclass
class EventOdds:
    id: str
    event_id: str
    timestamp: datetime
    home_odds: float
    away_odds: float
    sportbook_key: str | None
