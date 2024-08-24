import { type ClassValue, clsx } from "clsx";
import * as fs from "fs";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getEvents = async (): Promise<Event[]> => {
    const path = await fs.promises.readFile(
        process.cwd() + "/src/data/events.json",
        "utf8"
    );

    const data = JSON.parse(path);

    return data;
};

export const getOdds = async (): Promise<Record<string, EventOdds>> => {
    // go through everything in the data/odds folder

    const list = fs.readdir(process.cwd() + "/src/data/odds", (err, files) => {
        if (err) {
            console.error(err);
            return;
        }

        files.forEach((file) => {
            console.log("Read in file");
        });
    });

    return {};
};
