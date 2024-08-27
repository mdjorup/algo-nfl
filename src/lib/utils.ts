import { type ClassValue, clsx } from "clsx";
import { addDays } from "date-fns";
import { twMerge } from "tailwind-merge";
import { seasonStart } from "./consts";
import { query } from "./db";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getWinProbability = (homeOdds: number, awayOdds: number) => {
    const totalOdds = homeOdds + awayOdds;

    const implied_home_prob = 1 / homeOdds;
    const implied_away_prob = 1 / awayOdds;

    const total = implied_away_prob + implied_home_prob;

    const homeWinProbability = implied_home_prob / total;
    const awayWinProbability = implied_away_prob / total;

    return { homeWinProbability, awayWinProbability };
};

export const getCurrentWeekRange = () => {
    const now = new Date();

    let week = 1;

    let start = new Date(seasonStart);
    let end = addDays(start, 7);

    while (now > end) {
        start = end;
        end = addDays(start, 7);
        week++;
    }

    return { week, start, end };
};

export const getCurrentWeekEventsWithOdds = async () => {
    const { week, start, end } = getCurrentWeekRange();

    const events = await query<
        Event & {
            home_name: string;
            away_name: string;
            home_odds: number;
            away_odds: number;
            odds_timestamp: Date;
        }
    >(
        `SELECT 
    e.*,
    ht.name as home_name,
    at.name as away_name,
    eo.away_odds as away_odds,
    eo.home_odds as home_odds,
    eo.timestamp as odds_timestamp
FROM 
    events e
LEFT JOIN 
    teams ht ON e.home_team_id = ht.id
LEFT JOIN 
    teams at ON e.away_team_id = at.id
LEFT JOIN 
    (
        SELECT 
            event_id, 
            away_odds,
            home_odds,
            timestamp,
            ROW_NUMBER() OVER (PARTITION BY event_id ORDER BY timestamp DESC) as rn
        FROM 
            event_odds
    ) eo ON e.id = eo.event_id AND eo.rn = 1
            where e.commence_time between $1 and $2
            `,
        [start, end]
    );

    return events;
};
