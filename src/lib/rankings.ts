import { getAllEvents, getAllTeams } from "./dbFns";
import { Event, Team } from "./types";

export const compareTeams = (
    team1: Team,
    team2: Team,
    events: Event[]
): number => {
    const relevantEvents = events
        .filter((event) => {
            return event.completed;
        })
        .filter((event) => {
            return (
                event.home_team_id === team1.id ||
                event.away_team_id === team1.id
            );
        });

    let team1Wins = 0;
    let team2Wins = 0;

    relevantEvents.forEach((event) => {
        if (
            event.home_team_id === team1.id &&
            event.home_score > event.away_score
        ) {
            team1Wins++;
        } else if (
            event.away_team_id === team1.id &&
            event.away_score > event.home_score
        ) {
            team1Wins++;
        } else if (
            event.home_team_id === team2.id &&
            event.home_score > event.away_score
        ) {
            team2Wins++;
        } else if (
            event.away_team_id === team2.id &&
            event.away_score > event.home_score
        ) {
            team2Wins++;
        } else if (event.home_score === event.away_score) {
            if (
                event.home_team_id === team1.id ||
                event.away_team_id === team1.id
            ) {
                team1Wins += 0.5;
            } else if (
                event.home_team_id === team2.id ||
                event.away_team_id === team2.id
            ) {
                team2Wins += 0.5;
            }
        }
    });

    if (team1Wins > team2Wins) {
        return -1;
    } else if (team1Wins < team2Wins) {
        return 1;
    }

    // the wins are equal

    return 0;
};

export const getRankings = async () => {
    const teams = await getAllTeams();
    const events = await getAllEvents();

    const rankings = teams.sort((a, b) => {
        return compareTeams(a, b, events);
    });

    return rankings;
};
