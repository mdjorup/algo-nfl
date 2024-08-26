interface Event {
    id: string;
    home_team: string;
    away_team: string;
    commence_time: Date;
    completed: boolean;
    home_score?: number;
    away_score?: number;
}

interface EventOdds {
    id: string;
    event_id: string;
    timestamp: Date; // when the odds were last updated
    home_odds: number;
    away_odds: number;
}

interface RankingSet {
    id: string;
    name: string;
    timestamp: Date;
}

interface Ranking {
    id: string;
    ranking_set_id: string;
    team: string;
    rank: number; // 1 to 32
    description?: string; // optional description about the ranking
}

interface Team {
    id: string;
    name: string;
    division: string;
}
