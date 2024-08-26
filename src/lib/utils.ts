import { type ClassValue, clsx } from "clsx";
import { addDays } from "date-fns";
import { twMerge } from "tailwind-merge";
import { seasonStart } from "./consts";
import { query } from "./db";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

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

export const getCurrentWeekEvents = async () => {
    const { week, start, end } = getCurrentWeekRange();

    const events = await query<
        Event & {
            home_name: string;
            away_name: string;
        }
    >(
        `SELECT e.*, ht.name as home_name, at.name as away_name
            FROM events e
            LEFT JOIN teams ht ON e.home_team_id = ht.id
            LEFT JOIN teams at ON e.away_team_id = at.id
            where e.commence_time between $1 and $2
            `,
        [start, end]
    );

    const latestOdds = await query;

    return events;
};
