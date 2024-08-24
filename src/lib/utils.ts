import { type ClassValue, clsx } from "clsx";
import * as fs from "fs";
import * as path from "path";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getEvents = async (): Promise<ODDSAPI_Event[]> => {
    const path = await fs.promises.readFile(
        process.cwd() + "/src/data/events.json",
        "utf8"
    );

    const data = JSON.parse(path);

    return data;
};

export const getOdds = async (): Promise<Record<string, EventOdds>> => {
    // go through everything in the data/odds folder

    const dirPath = process.cwd() + "/src/data/odds";

    const res: Record<string, EventOdds> = {};

    const list = await fs.promises.readdir(dirPath);

    for (const file of list) {
        const filePath = path.join(dirPath, file);
        const data = await fs.promises.readFile(filePath, "utf8");
        const odds: ODDSAPI_Odds = JSON.parse(data);

        const home_team = odds.home_team;
        const away_team = odds.away_team;

        let total_home_odds = 0;
        let total_away_odds = 0;
        let n_bookmakers = 0;

        odds.bookmakers.forEach((bookmaker) => {
            bookmaker.markets.forEach((market) => {
                if (market.key !== "h2h") {
                    return;
                }
                market.outcomes.forEach((outcome) => {
                    if (outcome.name === home_team) {
                        total_home_odds += outcome.price;
                    } else if (outcome.name === away_team) {
                        total_away_odds += outcome.price;
                    }
                });
            });
            n_bookmakers++;
        });

        const avg_home_odds = total_home_odds / n_bookmakers;
        const avg_away_odds = total_away_odds / n_bookmakers;

        res[odds.id] = {
            away_odds: avg_away_odds,
            home_odds: avg_home_odds,
            home_team: home_team,
            away_team: away_team,
            updated: new Date(),
        };
    }

    return res;
};
