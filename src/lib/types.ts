interface ODDSAPI_Event {
    id: string;
    sport_key: string;
    sport_title: string;
    commence_time: string;
    home_team: string;
    away_team: string;
}

interface ODDSAPI_Odds {
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

interface EventOdds {
    home_team: string;
    away_team: string;
    home_odds: number;
    away_odds: number;
    updated: Date;
}
