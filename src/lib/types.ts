export interface Event {
    id: string;
    season: string;
    home_team_id: string;
    away_team_id: string;
    commence_time: Date;
    completed: boolean;
    home_score: number;
    away_score: number;
}

export interface ODDSAPI_Odds {
    id: string;
    sport_key: string;
    sport_title: string;
    commence_time: string;
    home_team: string;
    away_team: string;
    bookmakers: {
        key: string;
        title: string;
        markets: {
            key: "h2h";
            last_update: string;
            outcomes: {
                name: string;
                price: number;
            }[];
        }[];
    }[];
}

export interface EventOdds {
    id: string;
    event_id: string;
    timestamp: Date;
    home_odds: number;
    away_odds: number;
}

export interface SeasonSimulation {
    id: number;
    created_at: Date;
    simulation_group: number;
    team_id: string;
    make_playoffs_probability: number;
    win_division_probability: number;
    win_conference_probability: number;
    n_simulations: number;
}

export interface FullEvent {}
