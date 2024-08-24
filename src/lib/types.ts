interface Event {
    id: string;
    sport_key: string;
    sport_title: string;
    commence_time: string;
    home_team: string;
    away_team: string;
}

interface EventOdds {
    home_team: string;
    away_team: string;
    home_odds: number;
    away_odds: number;
    updated: Date;
}
