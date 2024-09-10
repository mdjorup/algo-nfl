import { getAllEvents, getAllTeams } from "./dbFns";
import { Event, Team } from "./types";

const getWLTPercentage = (wins: number, losses: number) => {
    if (wins + losses === 0) {
        return 0;
    }

    return wins / (wins + losses);
};

const getWinsAndLosses = (team: Team, events: Event[]) => {
    let wins = 0;
    let losses = 0;

    events.forEach((event) => {
        if (event.home_team_id === team.id) {
            if (event.home_score > event.away_score) {
                wins += 1;
            } else if (event.home_score < event.away_score) {
                losses += 1;
            } else {
                wins += 0.5;
                losses += 0.5;
            }
        } else if (event.away_team_id === team.id) {
            if (event.away_score > event.home_score) {
                wins += 1;
            } else if (event.away_score < event.home_score) {
                losses += 1;
            } else {
                wins += 0.5;
                losses += 0.5;
            }
        }
    });

    return { wins, losses };
};

const getCommonGames = (team1: Team, team2: Team, events: Event[]) => {
    const team1Opponents = new Set<string>();
    const team2Opponents = new Set<string>();

    events.forEach((event) => {
        if (
            event.home_team_id === team1.id &&
            event.away_team_id === team2.id
        ) {
            return;
        } else if (
            event.home_team_id === team2.id &&
            event.home_team_id === team1.id
        ) {
            return;
        }

        if (
            event.home_team_id === team1.id ||
            event.away_team_id === team1.id
        ) {
            team1Opponents.add(
                event.home_team_id === team1.id
                    ? event.away_team_id
                    : event.home_team_id
            );
        } else if (
            event.home_team_id === team2.id ||
            event.away_team_id === team2.id
        ) {
            team2Opponents.add(
                event.home_team_id === team2.id
                    ? event.away_team_id
                    : event.home_team_id
            );
        }
    });

    const intersect = team1Opponents.intersection(team2Opponents);

    return events.filter((event) => {
        if (
            intersect.has(event.home_team_id) ||
            intersect.has(event.away_team_id)
        ) {
            return true;
        }
        return false;
    });
};

const compareWithinDivision = (
    team1: Team,
    team2: Team,
    events: Event[],
    teams: Team[]
) => {
    const division = team1.division;

    if (team2.division !== division) {
        return 0;
    }

    // 1) head to head

    const relevantEvents = events.filter((event) => event.completed);

    const headToHeadGames = relevantEvents.filter((event) => {
        return (
            (event.home_team_id === team1.id &&
                event.away_team_id === team2.id) ||
            (event.home_team_id === team2.id && event.away_team_id === team1.id)
        );
    });

    let team1HeadToHeadWins = 0;
    let team2HeadToHeadWins = 0;

    headToHeadGames.forEach((event) => {
        if (event.home_score > event.away_score) {
            if (event.home_team_id === team1.id) {
                team1HeadToHeadWins++;
            } else {
                team2HeadToHeadWins++;
            }
        } else if (event.home_score < event.away_score) {
            if (event.away_team_id === team1.id) {
                team1HeadToHeadWins++;
            } else {
                team2HeadToHeadWins++;
            }
        }
    });

    if (team1HeadToHeadWins > team2HeadToHeadWins) {
        return -1;
    } else if (team1HeadToHeadWins < team2HeadToHeadWins) {
        return 1;
    }

    // 2) games within the division

    const team1DivisionGames = relevantEvents.filter((event) => {
        if (event.home_team_id === team1.id) {
            const oppTeam = teams.find(
                (team) => team.id === event.away_team_id
            );
            if (!oppTeam) return false;
            return oppTeam.division === division;
        } else if (event.away_team_id === team1.id) {
            const oppTeam = teams.find(
                (team) => team.id === event.home_team_id
            );
            if (!oppTeam) return false;
            return oppTeam.division === division;
        }
    });

    const team2DivisionGames = relevantEvents.filter((event) => {
        if (event.home_team_id === team2.id) {
            const oppTeam = teams.find(
                (team) => team.id === event.away_team_id
            );
            if (!oppTeam) return false;
            return oppTeam.division === division;
        } else if (event.away_team_id === team2.id) {
            const oppTeam = teams.find(
                (team) => team.id === event.home_team_id
            );
            if (!oppTeam) return false;
            return oppTeam.division === division;
        }
    });

    const { wins: team1Wins, losses: team1Losses } = getWinsAndLosses(
        team1,
        team1DivisionGames
    );
    const { wins: team2Wins, losses: team2Losses } = getWinsAndLosses(
        team2,
        team2DivisionGames
    );
    const team1DivisionWLTPercentage = getWLTPercentage(team1Wins, team1Losses);
    const team2DivisionWLTPercentage = getWLTPercentage(team2Wins, team2Losses);

    if (team1DivisionWLTPercentage > team2DivisionWLTPercentage) {
        return -1;
    } else if (team1DivisionWLTPercentage < team2DivisionWLTPercentage) {
        return 1;
    }

    // 3) common games
    const commonGames = getCommonGames(team1, team2, relevantEvents);

    if (commonGames.length >= 4) {
        const team1CommonWLT = getWinsAndLosses(team1, commonGames);
        const team2CommonWLT = getWinsAndLosses(team2, commonGames);

        const team1CommonWLTPercentage = getWLTPercentage(
            team1CommonWLT.wins,
            team1CommonWLT.losses
        );
        const team2CommonWLTPercentage = getWLTPercentage(
            team2CommonWLT.wins,
            team2CommonWLT.losses
        );

        if (team1CommonWLTPercentage > team2CommonWLTPercentage) {
            return -1;
        } else if (team1CommonWLTPercentage < team2CommonWLTPercentage) {
            return 1;
        }
    }

    return 0;
};

const compareWithinConference = (
    team1: Team,
    team2: Team,
    events: Event[],
    teams: Team[]
) => {
    // 1) head to head

    return 0;
};

export const compareTeams = (
    team1: Team,
    team2: Team,
    events: Event[],
    teams: Team[]
): number => {
    const relevantEvents = events.filter((event) => {
        return event.completed;
    });

    let team1Wins = 0;
    let team2Wins = 0;

    // 0) compare wins

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

    // there's a tie
    if (team1.division === team2.division) {
        return compareWithinDivision(team1, team2, events, teams);
    } else {
        return compareWithinConference(team1, team2, events, teams);
    }
};

export const getRankings = async () => {
    const teams = await getAllTeams();
    const events = await getAllEvents();

    const rankings = teams.sort((a, b) => {
        return compareTeams(a, b, events, teams);
    });

    return rankings;
};

export const getConferenceRankings = async () => {
    const rankings = await getRankings();

    const nfc = rankings.filter((team) => team.division.startsWith("NFC"));
    const afc = rankings.filter((team) => team.division.startsWith("AFC"));

    const seenDivisions = new Set<string>();

    const nfcDivisionWinners: Team[] = [];
    const nfcWildCard: Team[] = [];
    const afcDivisionWinners: Team[] = [];
    const afcWildCard: Team[] = [];

    nfc.forEach((team) => {
        if (!seenDivisions.has(team.division)) {
            seenDivisions.add(team.division);
            nfcDivisionWinners.push(team);
        } else {
            nfcWildCard.push(team);
        }
    });

    afc.forEach((team) => {
        if (!seenDivisions.has(team.division)) {
            seenDivisions.add(team.division);
            afcDivisionWinners.push(team);
        } else {
            afcWildCard.push(team);
        }
    });

    // join the division winners and wild cards
    const nfcRankings = nfcDivisionWinners.concat(nfcWildCard);
    const afcRankings = afcDivisionWinners.concat(afcWildCard);

    return { nfcRankings, afcRankings };
};
