import { getAllEvents, getAllTeams } from "./dbFns";
import { Event, Team } from "./types";

const getWLTPercentage = (wins: number, losses: number) =>
    wins + losses === 0 ? 0 : wins / (wins + losses);

const getWinsAndLosses = (team: Team, events: Event[]) => {
    const result = { wins: 0, losses: 0 };
    events.forEach((event) => {
        const isHomeTeam = event.home_team_id === team.id;
        const teamScore = isHomeTeam ? event.home_score : event.away_score;
        const opponentScore = isHomeTeam ? event.away_score : event.home_score;

        if (teamScore > opponentScore) result.wins++;
        else if (teamScore < opponentScore) result.losses++;
        else {
            result.wins += 0.5;
            result.losses += 0.5;
        }
    });
    return result;
};

const getCommonGames = (team1: Team, team2: Team, events: Event[]) => {
    const getOpponents = (team: Team) =>
        new Set(
            events
                .filter(
                    (e) =>
                        e.home_team_id === team.id || e.away_team_id === team.id
                )
                .map((e) =>
                    e.home_team_id === team.id ? e.away_team_id : e.home_team_id
                )
        );

    const team1Opponents = getOpponents(team1);
    const team2Opponents = getOpponents(team2);
    const commonOpponents = new Set(
        Array.from(team1Opponents).filter((x) => team2Opponents.has(x))
    );

    return events.filter(
        (e) =>
            commonOpponents.has(e.home_team_id) ||
            commonOpponents.has(e.away_team_id)
    );
};

const compareHeadToHead = (team1: Team, team2: Team, events: Event[]) => {
    const headToHeadGames = events.filter(
        (e) =>
            (e.home_team_id === team1.id && e.away_team_id === team2.id) ||
            (e.home_team_id === team2.id && e.away_team_id === team1.id)
    );
    const { wins: team1Wins } = getWinsAndLosses(team1, headToHeadGames);
    const { wins: team2Wins } = getWinsAndLosses(team2, headToHeadGames);
    return team1Wins > team2Wins ? -1 : team1Wins < team2Wins ? 1 : 0;
};

const compareDivisionRecord = (
    team1: Team,
    team2: Team,
    events: Event[],
    teams: Team[]
) => {
    const getDivisionGames = (team: Team) =>
        events.filter(
            (e) =>
                (e.home_team_id === team.id || e.away_team_id === team.id) &&
                teams.find(
                    (t) =>
                        t.id ===
                        (e.home_team_id === team.id
                            ? e.away_team_id
                            : e.home_team_id)
                )?.division === team.division
        );
    const team1DivisionWLT = getWinsAndLosses(team1, getDivisionGames(team1));
    const team2DivisionWLT = getWinsAndLosses(team2, getDivisionGames(team2));
    const team1Percentage = getWLTPercentage(
        team1DivisionWLT.wins,
        team1DivisionWLT.losses
    );
    const team2Percentage = getWLTPercentage(
        team2DivisionWLT.wins,
        team2DivisionWLT.losses
    );
    return team1Percentage > team2Percentage
        ? -1
        : team1Percentage < team2Percentage
        ? 1
        : 0;
};

const compareCommonGames = (
    team1: Team,
    team2: Team,
    events: Event[],
    minGames: number = 0
) => {
    const commonGames = getCommonGames(team1, team2, events);
    if (commonGames.length < minGames) return 0;
    const team1CommonWLT = getWinsAndLosses(team1, commonGames);
    const team2CommonWLT = getWinsAndLosses(team2, commonGames);
    const team1Percentage = getWLTPercentage(
        team1CommonWLT.wins,
        team1CommonWLT.losses
    );
    const team2Percentage = getWLTPercentage(
        team2CommonWLT.wins,
        team2CommonWLT.losses
    );
    return team1Percentage > team2Percentage
        ? -1
        : team1Percentage < team2Percentage
        ? 1
        : 0;
};

const compareConferenceGames = (team1: Team, team2: Team, events: Event[]) => {
    return 0;
};

const compareTeams = (
    team1: Team,
    team2: Team,
    events: Event[],
    teams: Team[],
    by: "conference" | "division"
): number => {
    const relevantEvents = events.filter(
        (e) =>
            e.completed &&
            teams.find(
                (t) => t.id === e.home_team_id || t.id === e.away_team_id
            )
    );
    const team1Record = getWinsAndLosses(team1, relevantEvents);
    const team2Record = getWinsAndLosses(team2, relevantEvents);

    if (team1Record.wins !== team2Record.wins) {
        return team1Record.wins > team2Record.wins ? -1 : 1;
    }

    // these stop after strength
    if (by === "division") {
        const h2h = compareHeadToHead(team1, team2, relevantEvents);
        if (h2h !== 0) return h2h;
        const div = compareDivisionRecord(team1, team2, relevantEvents, teams);
        if (div !== 0) return div;
        const common = compareCommonGames(team1, team2, relevantEvents, 4);
        if (common !== 0) return common;
        const conf = compareConferenceGames(team1, team2, relevantEvents);
        if (conf !== 0) return conf;
        return 0;
    }

    if (by === "conference") {
        const h2h = compareHeadToHead(team1, team2, relevantEvents);
        if (h2h !== 0) return h2h;
        const div = compareConferenceGames(team1, team2, relevantEvents);
        if (div !== 0) return div;
        const common = compareCommonGames(team1, team2, relevantEvents, 4);
        if (common !== 0) return common;
        return 0;
    }

    // Implement conference tiebreakers if needed
    return 0;
};

export const getRankings = async (
    conference: "NFC" | "AFC",
    division?: "East" | "North" | "South" | "West"
) => {
    const [teams, events] = await Promise.all([getAllTeams(), getAllEvents()]);

    // The teams to compare
    const relevantTeams = teams.filter((team) =>
        division
            ? team.division === `${conference} ${division}`
            : team.division.startsWith(conference)
    );

    return relevantTeams.sort((a, b) =>
        compareTeams(a, b, events, teams, division ? "division" : "conference")
    );
};

export const getConferenceRankings = async (conference: "NFC" | "AFC") => {
    const rankings = await getRankings(conference);
    const groupByConference = (conference: string) =>
        rankings.filter((team) => team.division.startsWith(conference));

    const getDivisionWinnersAndWildCards = (teams: Team[]) => {
        const divisionWinners: Team[] = [];
        const wildCards: Team[] = [];
        const seenDivisions = new Set<string>();

        teams.forEach((team) => {
            if (!seenDivisions.has(team.division)) {
                seenDivisions.add(team.division);
                divisionWinners.push(team);
            } else {
                wildCards.push(team);
            }
        });

        return divisionWinners.concat(wildCards);
    };

    return {
        nfcRankings: getDivisionWinnersAndWildCards(groupByConference("NFC")),
        afcRankings: getDivisionWinnersAndWildCards(groupByConference("AFC")),
    };
};

type DivisionRankings = {
    [division: string]: Team[];
};

export const getAllDivisionRankings = async (): Promise<DivisionRankings> => {
    const [teams, events]: [Team[], Event[]] = await Promise.all([
        getAllTeams(),
        getAllEvents(),
    ]);

    const divisions: string[] = [
        "NFC East",
        "NFC North",
        "NFC South",
        "NFC West",
        "AFC East",
        "AFC North",
        "AFC South",
        "AFC West",
    ];

    const divisionRankings: DivisionRankings = divisions.reduce(
        (acc: DivisionRankings, division: string) => {
            const divisionTeams = teams.filter(
                (team) => team.division === division
            );
            acc[division] = divisionTeams.sort((a, b) =>
                compareTeams(a, b, events, teams, "division")
            );
            return acc;
        },
        {}
    );

    return divisionRankings;
};
