import { Event, TeamRecordRow } from "@/lib/types";

export const getTeamRecord = (
    events: Event[],
    teams: Team[]
): Record<string, TeamRecordRow> => {
    const teamRecords: Record<string, TeamRecordRow> = {};

    const completedEvents = events.filter((event) => event.completed);

    completedEvents.forEach((event) => {
        const homeTeamId = event.home_team_id;
        const awayTeamId = event.away_team_id;

        const homeTeam = teams.find((team) => team.id === homeTeamId);
        const awayTeam = teams.find((team) => team.id === awayTeamId);

        if (!homeTeam || !awayTeam) {
            return {};
        }

        if (!teamRecords[homeTeamId]) {
            teamRecords[homeTeamId] = {
                teamId: homeTeamId,
                teamName: homeTeam.name,
                wins: 0,
                losses: 0,
                ties: 0,
                pointsFor: 0,
                pointsAgainst: 0,
                divisionWins: 0,
                divisionLosses: 0,
                divisionTies: 0,
                conferenceWins: 0,
                conferenceLosses: 0,
                conferenceTies: 0,
            };
        }

        if (!teamRecords[awayTeamId]) {
            teamRecords[awayTeamId] = {
                teamId: awayTeamId,
                teamName: awayTeam.name,
                wins: 0,
                losses: 0,
                ties: 0,
                pointsFor: 0,
                pointsAgainst: 0,
                divisionWins: 0,
                divisionLosses: 0,
                divisionTies: 0,
                conferenceWins: 0,
                conferenceLosses: 0,
                conferenceTies: 0,
            };
        }

        const homeTeamRecord = teamRecords[homeTeamId];
        const awayTeamRecord = teamRecords[awayTeamId];

        homeTeamRecord.pointsFor += event.home_score;
        homeTeamRecord.pointsAgainst += event.away_score;
        awayTeamRecord.pointsFor += event.away_score;
        awayTeamRecord.pointsAgainst += event.home_score;

        if (event.home_score > event.away_score) {
            homeTeamRecord.wins += 1;
            awayTeamRecord.losses += 1;
        } else if (event.home_score < event.away_score) {
            homeTeamRecord.losses += 1;
            awayTeamRecord.wins += 1;
        } else {
            homeTeamRecord.ties += 1;
            awayTeamRecord.ties += 1;
        }

        if (homeTeam.division === awayTeam.division) {
            if (event.home_score > event.away_score) {
                homeTeamRecord.divisionWins += 1;
                awayTeamRecord.divisionLosses += 1;
            } else if (event.home_score < event.away_score) {
                homeTeamRecord.divisionLosses += 1;
                awayTeamRecord.divisionWins += 1;
            } else {
                homeTeamRecord.divisionTies += 1;
                awayTeamRecord.divisionTies += 1;
            }
        }

        if (
            homeTeam.division.split(" ")[0] === awayTeam.division.split(" ")[0]
        ) {
            if (event.home_score > event.away_score) {
                homeTeamRecord.conferenceWins += 1;
                awayTeamRecord.conferenceLosses += 1;
            } else if (event.home_score < event.away_score) {
                homeTeamRecord.conferenceLosses += 1;
                awayTeamRecord.conferenceWins += 1;
            } else {
                homeTeamRecord.conferenceTies += 1;
                awayTeamRecord.conferenceTies += 1;
            }
        }
    });

    return teamRecords;
};

type WinnersAndLosers = [string[], string[]];

const getByH2hWinner = (
    teamIds: string[],
    eventResults: Event[]
): WinnersAndLosers => {
    const teamH2hWinPct: Record<string, { wins: number; totalGames: number }> =
        {};

    teamIds.forEach((teamId) => {
        teamH2hWinPct[teamId] = { wins: 0, totalGames: 0 };
    });

    eventResults.forEach((event) => {
        if (
            teamIds.includes(event.home_team_id) &&
            teamIds.includes(event.away_team_id)
        ) {
            const homeTeamId = event.home_team_id;
            const awayTeamId = event.away_team_id;

            if (event.home_score > event.away_score) {
                teamH2hWinPct[homeTeamId].wins += 1;
            } else if (event.home_score < event.away_score) {
                teamH2hWinPct[awayTeamId].wins += 1;
            }
            teamH2hWinPct[homeTeamId].totalGames += 1;
            teamH2hWinPct[awayTeamId].totalGames += 1;
        }
    });

    const maxWinPct = Math.max(
        ...Object.values(teamH2hWinPct).map((team) =>
            team.totalGames > 0 ? team.wins / team.totalGames : 0
        )
    );

    const h2hWinners = Object.entries(teamH2hWinPct)
        .filter(
            ([teamId, { wins, totalGames }]) =>
                (totalGames > 0 ? wins / totalGames : 0) === maxWinPct
        )
        .map(([teamId, _]) => teamId);
    const h2hLosers = teamIds.filter((teamId) => !h2hWinners.includes(teamId));

    return [h2hWinners, h2hLosers];
};

const getByDivisionWinPct = (
    teamIds: string[],
    teamRecordMap: Record<string, TeamRecordRow>
) => {
    const getDivisionWinPct = (teamId: string) => {
        const teamRecord = teamRecordMap[teamId];
        const wins = teamRecord.divisionWins + teamRecord.divisionTies / 2;
        const totalDivisonGames =
            teamRecord.divisionWins +
            teamRecord.divisionLosses +
            teamRecord.divisionTies;
        return totalDivisonGames > 0 ? wins / totalDivisonGames : 0;
    };

    const maxWinPct = Math.max(
        ...teamIds.map((teamId) => getDivisionWinPct(teamId))
    );

    const divisionWinners = teamIds.filter((teamId) => {
        return getDivisionWinPct(teamId) === maxWinPct;
    });
    const divisionLosers = teamIds.filter(
        (teamId) => !divisionWinners.includes(teamId)
    );

    return [divisionWinners, divisionLosers];
};

const getByH2hSweep = (teamIds: string[], eventResults: Event[]) => {
    const teamH2hWins: Record<string, string[]> = {};

    teamIds.forEach((teamId) => {
        teamH2hWins[teamId] = [];
    });

    eventResults.forEach((event) => {
        if (
            teamIds.includes(event.home_team_id) &&
            teamIds.includes(event.away_team_id)
        ) {
            const homeTeamId = event.home_team_id;
            const awayTeamId = event.away_team_id;

            if (event.home_score > event.away_score) {
                teamH2hWins[homeTeamId].push(awayTeamId);
            } else if (event.home_score < event.away_score) {
                teamH2hWins[awayTeamId].push(homeTeamId);
            }
        }
    });

    const sweepers = Object.entries(teamH2hWins).find(
        ([teamId, opponents]) => opponents.length === teamIds.length - 1
    );
    if (sweepers === undefined) {
        return [teamIds, []];
    }

    const [sweeperId, opponents] = sweepers;

    return [[sweeperId], opponents];
};

const getByConferenceWinPct = (
    teamIds: string[],
    teamRecordMap: Record<string, TeamRecordRow>
) => {
    const getConferenceWinPct = (teamId: string) => {
        const teamRecord = teamRecordMap[teamId];
        const wins = teamRecord.conferenceWins + teamRecord.conferenceTies / 2;
        const totalConferenceGames =
            teamRecord.conferenceWins +
            teamRecord.conferenceLosses +
            teamRecord.conferenceTies;
        return totalConferenceGames > 0 ? wins / totalConferenceGames : 0;
    };

    const maxWinPct = Math.max(
        ...teamIds.map((teamId) => getConferenceWinPct(teamId))
    );

    const conferenceWinners = teamIds.filter((teamId) => {
        return getConferenceWinPct(teamId) === maxWinPct;
    });
    const conferenceLosers = teamIds.filter(
        (teamId) => !conferenceWinners.includes(teamId)
    );
    return [conferenceWinners, conferenceLosers];
};

const breakDivisionTie = (
    teamIds: string[],
    eventResults: Event[],
    teamRecordMap: Record<string, TeamRecordRow>
): string[] => {
    console.log("Starting breakDivisionTie with teamIds:", teamIds);

    if (teamIds.length === 0) {
        console.log("No teams provided, returning empty array");
        return [];
    }
    if (teamIds.length === 1) {
        console.log("Only one team provided, returning:", teamIds);
        return teamIds;
    } else if (teamIds.length === 2) {
        let winners = teamIds;
        let losers: string[] = [];
        console.log("Breaking division tie for two teams:", teamIds);

        console.log("Getting head-to-head winner");
        const [h2hWinners, h2hLosers] = getByH2hWinner(teamIds, eventResults);
        console.log("H2H Winners:", h2hWinners, "H2H Losers:", h2hLosers);
        if (h2hWinners.length === 1) {
            console.log(
                "Clear H2H winner, recursively breaking tie for losers"
            );
            return [
                ...h2hWinners,
                ...breakDivisionTie(h2hLosers, eventResults, teamRecordMap),
            ];
        }
        console.log("No clear H2H winner, proceeding to division win %");

        winners = h2hWinners;
        losers = [...h2hLosers, ...losers];

        console.log("Breaking division tie by division win %");
        const [divisionWinners, divisionLosers] = getByDivisionWinPct(
            winners,
            teamRecordMap
        );
        console.log(
            "Division Winners:",
            divisionWinners,
            "Division Losers:",
            divisionLosers
        );

        if (divisionWinners.length === 1) {
            console.log(
                "Clear division winner, recursively breaking tie for losers"
            );
            return [
                ...divisionWinners,
                ...breakDivisionTie(
                    [...divisionLosers, ...losers],
                    eventResults,
                    teamRecordMap
                ),
            ];
        }
        winners = divisionWinners;
        losers = [...divisionLosers, ...losers];
        console.log("No clear division winner, returning current order:", [
            ...winners,
            ...losers,
        ]);
        // TODO

        return [...winners, ...losers];
    } else if (teamIds.length >= 3) {
        console.log("Breaking division tie for three or more teams:", teamIds);
        let winners = teamIds;
        let losers: string[] = [];

        console.log("Getting head-to-head winners");
        const [h2hWinners, h2hLosers] = getByH2hWinner(teamIds, eventResults);
        console.log("H2H Winners:", h2hWinners, "H2H Losers:", h2hLosers);
        if (h2hWinners.length === 1) {
            console.log(
                "Clear H2H winner, recursively breaking tie for losers"
            );
            return [
                ...h2hWinners,
                ...breakDivisionTie(h2hLosers, eventResults, teamRecordMap),
            ];
        }
        winners = h2hWinners;
        losers = [...h2hLosers, ...losers];

        console.log("No clear H2H winner, breaking tie by division win %");
        const [divisionWinners, divisionLosers] = getByDivisionWinPct(
            h2hWinners,
            teamRecordMap
        );
        console.log(
            "Division Winners:",
            divisionWinners,
            "Division Losers:",
            divisionLosers
        );
        if (divisionWinners.length === 1) {
            console.log(
                "Clear division winner, recursively breaking tie for losers"
            );
            return [
                divisionWinners[0],
                ...breakDivisionTie(
                    [...divisionLosers, ...losers],
                    eventResults,
                    teamRecordMap
                ),
            ];
        }
        winners = divisionWinners;
        losers = [...divisionLosers, ...losers];
        console.log("No clear division winner, returning current order:", [
            ...winners,
            ...losers,
        ]);
        return [...winners, ...losers];
    }
    console.log("Unexpected case, returning original teamIds:", teamIds);
    return teamIds;
};

const breakConferenceTie = (
    teamIds: string[],
    eventResults: Event[],
    teamRecordMap: Record<string, TeamRecordRow>
): string[] => {
    console.log(
        "Breaking conference tie for",
        teamIds.map((teamId) => teamRecordMap[teamId].teamName).join(", ")
    );
    if (teamIds.length === 1) {
        return teamIds;
    } else if (teamIds.length === 2) {
        let winners = teamIds;
        let losers: string[] = [];

        const [h2hWinners, h2hLosers] = getByH2hWinner(teamIds, eventResults);
        console.log(
            "Head-to-head winners:",
            h2hWinners.map((id) => teamRecordMap[id].teamName)
        );

        if (h2hWinners.length === 1) {
            return [
                ...h2hWinners,
                ...breakConferenceTie(h2hLosers, eventResults, teamRecordMap),
            ];
        }

        winners = h2hWinners;
        losers = h2hLosers;

        const [conferenceWinners, conferenceLosers] = getByConferenceWinPct(
            winners,
            teamRecordMap
        );
        console.log(
            "Conference win % winners:",
            conferenceWinners.map((id) => teamRecordMap[id].teamName)
        );

        if (conferenceWinners.length === 1) {
            return [
                ...conferenceWinners,
                ...breakConferenceTie(
                    [...conferenceLosers, ...losers],
                    eventResults,
                    teamRecordMap
                ),
            ];
        }

        winners = conferenceWinners;
        losers = [...conferenceLosers, ...losers];

        return [...winners, ...losers];
    } else if (teamIds.length >= 3) {
        // Existing code for 3 or more teams...
        // Add similar logging statements here

        let winners = teamIds;
        let losers: string[] = [];
    }
    return teamIds;
};

const breakTie = (
    teamIds: string[],
    eventResults: Event[],
    teamRecordMap: Record<string, TeamRecordRow>,
    by: "division" | "conference"
): string[] => {
    if (teamIds.length === 1) {
        return teamIds;
    }

    if (by === "division") {
        const order = breakDivisionTie(teamIds, eventResults, teamRecordMap);
        return order;
    } else if (by === "conference") {
        const order = breakConferenceTie(teamIds, eventResults, teamRecordMap);
        return order;
    }

    return teamIds;
};

export const rankTeams = (
    teamIds: string[],
    eventResults: Event[],
    teamRecordMap: Record<string, TeamRecordRow>,
    by: "division" | "conference"
) => {
    const relevantEvents = eventResults.filter((event) => event.completed);

    // 1)

    teamIds.sort(
        (a, b) =>
            teamRecordMap[b].wins +
            teamRecordMap[b].ties / 2 -
            (teamRecordMap[a].wins + teamRecordMap[a].ties / 2)
    );

    const finalRanking: string[] = [];

    let latestWins = -1;
    let currentWinList: string[] = [];

    for (const teamId of teamIds) {
        const teamWins =
            teamRecordMap[teamId].wins + teamRecordMap[teamId].ties / 2;
        if (teamWins === latestWins) {
            currentWinList.push(teamId);
        } else {
            if (currentWinList.length > 0) {
                // need to break tie
                const rankedOrder = breakTie(
                    currentWinList,
                    relevantEvents,
                    teamRecordMap,
                    by
                );
                finalRanking.push(...rankedOrder);
                currentWinList = [];
            }
            currentWinList.push(teamId);
            latestWins = teamWins;
        }
    }

    if (currentWinList.length >= 1) {
        const rankedOrder = breakTie(
            currentWinList,
            relevantEvents,
            teamRecordMap,
            by
        );
        finalRanking.push(...rankedOrder);
    }

    return finalRanking;
};
