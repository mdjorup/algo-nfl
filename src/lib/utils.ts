import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
