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
                const rankedOrder = currentWinList;
                finalRanking.push(...rankedOrder);
                currentWinList = [];
            }
            currentWinList.push(teamId);
            latestWins = teamWins;
        }
    }

    if (currentWinList.length >= 1) {
        finalRanking.push(...currentWinList);
    }

    return finalRanking;
};
