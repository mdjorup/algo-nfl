import json
import random
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from enum import Enum
from functools import cmp_to_key
from typing import List, Optional

from average import RunningAverage
from db import pool
from psycopg2.extras import RealDictCursor

N_SIMULATIONS = 100000
CURRENT_SEASON = "2024"


@dataclass
class Team:
    id: str
    name: str
    division: str
    season: str
    wins: int
    losses: int
    ties: int


@dataclass
class Event:
    id: str
    season: str
    home_team_id: str
    away_team_id: str
    commence_time: datetime
    completed: bool
    home_score: int
    away_score: int


@dataclass
class EventOdds:
    id: str
    event_id: str
    timestamp: datetime
    home_odds: float
    away_odds: float


class RankingType(Enum):
    DIVISION = 1
    CONFERENCE = 2


def load_data() -> tuple[List[Team], List[Event], List[EventOdds]]:

    conn = pool.getconn()

    teams: List[Team] = []
    events: List[Event] = []
    odds: List[EventOdds] = []

    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        # Execute a query
        cursor.execute("SELECT * FROM teams where season = %s", (CURRENT_SEASON,))

        db_teams = cursor.fetchall()

    for team in db_teams:
        new_team = Team(
            team["id"],
            team["name"],
            team["division"],
            team["season"],
            team["wins"],
            team["losses"],
            team["ties"],
        )
        teams.append(new_team)

    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        # Execute a query
        cursor.execute("SELECT * FROM events where season = %s", (CURRENT_SEASON,))

        db_events = cursor.fetchall()

    for event in db_events:
        new_event = Event(
            event["id"],
            event["season"],
            event["home_team_id"],
            event["away_team_id"],
            event["commence_time"],
            event["completed"],
            event["home_score"],
            event["away_score"],
        )
        events.append(new_event)

    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        # Execute a query
        cursor.execute(
            """SELECT DISTINCT ON (event_id) * FROM public.event_odds ORDER BY event_id, "timestamp" DESC;"""
        )

        db_odds = cursor.fetchall()

    for event_odd in db_odds:
        new_event = EventOdds(
            event_odd["id"],
            event_odd["event_id"],
            event_odd["timestamp"],
            event_odd["home_odds"],
            event_odd["away_odds"],
        )

        odds.append(new_event)

    pool.putconn(conn)

    return teams, events, odds


def compute_win_prob(home_odds: float, away_odds: float) -> tuple[float, float]:
    implied_home_prob = 1 / home_odds
    implied_away_prob = 1 / away_odds
    total = implied_home_prob + implied_away_prob

    home_win_prob = implied_home_prob / total
    away_win_prob = implied_away_prob / total

    return home_win_prob, away_win_prob


class NFLSimulation:

    def __init__(self, teams, events, odds):
        self.team_map = {team.id: team for team in teams}
        self.event_map = {event.id: event for event in events}
        self.event_odds_map = {eo.event_id: eo for eo in odds}

    def simulate_season(self):
        results_map = {}

        for team_id in self.team_map.keys():
            results_map[team_id] = {"wins": [], "losses": [], "ties": []}

        for _, event in self.event_map.items():

            home_team_id = event.home_team_id
            away_team_id = event.away_team_id

            completed = event.completed

            if completed:
                home_score = event.home_score
                away_score = event.away_score

                if home_score > away_score:
                    results_map[home_team_id]["wins"].append(event.id)
                    results_map[away_team_id]["losses"].append(event.id)
                elif away_score > home_score:
                    results_map[home_team_id]["losses"].append(event.id)
                    results_map[away_team_id]["wins"].append(event.id)
                else:
                    results_map[home_team_id]["ties"].append(event.id)
                    results_map[away_team_id]["ties"].append(event.id)

                continue

            event_odd = self.event_odds_map[event.id]

            home_odds = event_odd.home_odds
            away_odds = event_odd.away_odds

            home_prob, away_prob = compute_win_prob(home_odds, away_odds)

            is_home_win = random.random() <= home_prob

            if is_home_win:

                results_map[home_team_id]["wins"].append(event.id)
                results_map[away_team_id]["losses"].append(event.id)

            else:
                results_map[home_team_id]["losses"].append(event.id)
                results_map[away_team_id]["wins"].append(event.id)

        return results_map

    def get_wins(self, results, team_id):
        return len(results[team_id]["wins"]) + (len(results[team_id]["ties"]) / 2)

    def rank_by_wins(self, results, t1_id, t2_id):
        team_1_wins = self.get_wins(results, t1_id)
        team_2_wins = self.get_wins(results, t2_id)
        if team_1_wins > team_2_wins:
            return -1
        elif team_2_wins > team_1_wins:
            return 1
        else:
            return 0

    def compute_rankings(
        self, season_results, team_ids, ranking_type: RankingType
    ) -> List[str]:
        final_ranking = []

        teams_sorted_by_wins = sorted(
            team_ids,
            key=cmp_to_key(lambda t1, t2: self.rank_by_wins(season_results, t1, t2)),
        )

        latest_wins = -1
        current_win_list = []

        for t in teams_sorted_by_wins:
            wins = self.get_wins(season_results, t)
            if wins == latest_wins:
                current_win_list.append(t)
            else:
                if len(current_win_list) > 0:

                    ranked_order = self.break_tie(
                        season_results, current_win_list, ranking_type
                    )
                    final_ranking.extend(ranked_order)
                    current_win_list = []

                current_win_list.append(t)
                latest_wins = wins
        else:
            ranked_order = self.break_tie(
                season_results, current_win_list, ranking_type
            )
            final_ranking.extend(ranked_order)

        return final_ranking

    def break_division_tie(self, results, teams, ranking_type):
        # Use self.team_map and self.event_map instead of globals
        if len(teams) == 1:
            return teams[0], teams[1:]
        elif len(teams) == 2:

            # print(f"1) Head to Head between {', '.join([team_map[t].name for t in teams])}")
            # 1) head to head
            h2h_winners, h2h_losers = self.get_h2h_winner(results, teams)
            if len(h2h_winners) == 1:
                return h2h_winners[0], h2h_losers

            # 2) division record
            # print(
            #     f"2) Division Record between {', '.join([team_map[t].name for t in teams])}"
            # )

            t1_division_win_pct = self.get_division_win_pct(results, teams[0])
            t2_division_win_pct = self.get_division_win_pct(results, teams[1])
            if t1_division_win_pct > t2_division_win_pct:
                return teams[0], [teams[1]]
            elif t2_division_win_pct > t1_division_win_pct:
                return teams[1], [teams[0]]

            # 3) common opponents
            # print(f"3) Common Opponents {', '.join([team_map[t].name for t in teams])}")

            common_opponents = self.get_common_opponents(results, teams)

            if len(common_opponents) > 0:
                common_opponents_set = set(common_opponents)

                common_opponent_wins = {t: 0.0 for t in teams}
                for team in teams:
                    common_wins = results[team]["wins"]
                    common_ties = results[team]["ties"]

                    for event_id in common_wins:
                        event = self.event_map[event_id]
                        if (
                            event.home_team_id in common_opponents_set
                            or event.away_team_id in common_opponents_set
                        ):
                            common_opponent_wins[team] += 1
                    for event_id in common_ties:
                        event = self.event_map[event_id]
                        if (
                            event.home_team_id in common_opponents_set
                            or event.away_team_id in common_opponents_set
                        ):
                            common_opponent_wins[team] += 0.5
                max_wins = max(common_opponent_wins.values())
                winning_teams = [
                    t for t in teams if common_opponent_wins[t] == max_wins
                ]
                if len(winning_teams) == 1:
                    return winning_teams[0], [t for t in teams if t != winning_teams[0]]

            # 4) conference record

            # print(f"4) Conference Record {', '.join([team_map[t].name for t in teams])}")

            conference_winners, conference_losers = self.get_conference_record_results(
                results, teams
            )
            if len(conference_winners) == 1:
                return conference_winners[0], conference_losers

            #  5) strength of victory

            # print(f"5) Strength of Victory {', '.join([team_map[t].name for t in teams])}")

            sov_winners, sov_losers = self.get_strength_of_victory(results, teams)
            if len(sov_winners) == 1:
                return sov_winners[0], sov_losers

            # 6) strength of schedule
            # print(f"6) Strength of Schedule {', '.join([team_map[t].name for t in teams])}")

            sos_winners, sos_losers = self.get_strength_of_schedule(results, teams)
            if len(sos_winners) == 1:
                return sos_winners[0], sos_losers

            # Next are points rankings... Not implementing for now

            return teams[0], teams[1:]
        elif len(teams) >= 3:

            # 3 or more team tiebreaker
            return teams[0], teams[1:]

        else:
            return teams[0], teams[1:]

    def break_conference_tie(self, results, teams):
        # TODO: Implement
        # return a winning team, losing teams

        if len(teams) == 1:
            return teams[0], []
        elif len(teams) >= 2:
            # head to head

            # 1) head to head
            # print("1) Head to Head")
            h2h_winners, h2h_losers = self.get_h2h_winner(results, teams)
            if len(h2h_winners) == 1:
                return h2h_winners[0], h2h_losers

            new_teams = h2h_winners

            # print("2) Conference WLT ")

            # 2) conference record
            conference_winners, conference_losers = self.get_conference_record_results(
                results, new_teams
            )
            if len(conference_winners) == 1:
                return conference_winners[0], [
                    t for t in teams if t != conference_winners[0]
                ]

            new_teams = conference_winners

            # print("3) Strength of Victory")
            sov_winners, sov_losers = self.get_strength_of_victory(results, new_teams)
            if len(sov_winners) == 1:
                return sov_winners[0], [t for t in teams if t != sov_winners[0]]

            new_teams = sov_winners

            return teams[0], teams[1:]
        else:
            return teams[0], teams[1:]

    def break_tie(self, results, teams, ranking_type):
        if len(teams) == 1:
            return teams

        if ranking_type == RankingType.DIVISION:
            winner, losers = self.break_division_tie(results, teams, ranking_type)
        elif ranking_type == RankingType.CONFERENCE:
            winner, losers = self.break_conference_tie(results, teams)

        return [winner] + self.break_tie(results, losers, ranking_type)

    def get_h2h_winner(self, results, teams):

        teams_set = set(teams)

        team_h2h_win_pct = {t: 0.0 for t in teams}

        for team in teams:
            wins = results[team]["wins"]
            losses = results[team]["losses"]
            ties = results[team]["ties"]
            win_total = 0
            total_games = 0
            for win in wins:
                event = self.event_map[win]
                if event.home_team_id in teams_set and event.away_team_id in teams_set:
                    win_total += 1
                    total_games += 1
            for tie in ties:
                event = self.event_map[tie]
                if event.home_team_id in teams_set and event.away_team_id in teams_set:
                    win_total += 0.5
                    total_games += 1
            for loss in losses:
                event = self.event_map[loss]
                if event.home_team_id in teams_set and event.away_team_id in teams_set:
                    total_games += 1

            if total_games == 0:
                team_h2h_win_pct[team] = 0
                continue

            team_h2h_win_pct[team] = win_total / total_games

        max_pct = max(team_h2h_win_pct.values())

        winners = [t for t in teams if team_h2h_win_pct[t] == max_pct]
        losers = [t for t in teams if team_h2h_win_pct[t] != max_pct]

        return winners, losers

    def get_division_win_pct(self, results, team_id):
        division = self.team_map[team_id].division
        wins = results[team_id]["wins"]
        losses = results[team_id]["losses"]
        ties = results[team_id]["ties"]

        total_games = len(wins) + len(losses) + len(ties)
        division_wins = len(
            [
                eid
                for eid in wins
                if self.event_map[eid].home_team_id in division
                and self.event_map[eid].away_team_id in division
            ]
        )
        division_ties = len(
            [
                eid
                for eid in ties
                if self.event_map[eid].home_team_id in division
                and self.event_map[eid].away_team_id in division
            ]
        )
        score = division_wins + division_ties / 2
        return score / total_games

    def get_common_opponents(self, results, teams) -> List[str]:

        teams_set = set(teams)

        team_opponents = {}

        for team in teams:
            team_opponents[team] = set()
            res = results[team]
            games = res["wins"] + res["losses"] + res["ties"]
            for event_id in games:
                event = self.event_map[event_id]
                if event.home_team_id == team and not event.away_team_id in teams_set:
                    team_opponents[team].add(event.away_team_id)
                elif event.away_team_id == team and not event.home_team_id in teams_set:
                    team_opponents[team].add(event.home_team_id)

        common_opponents = set()

        for team in teams:
            if len(common_opponents) == 0:
                common_opponents = team_opponents[team]
            else:
                common_opponents = common_opponents.intersection(team_opponents[team])

        return list(common_opponents)

    def get_win_pct(self, results, team_id):
        wins = len(results[team_id]["wins"])
        losses = len(results[team_id]["losses"])
        ties = len(results[team_id]["ties"])
        return (wins + ties / 2) / (wins + losses + ties)

    def get_strength_of_victory(self, results, teams) -> tuple[List[str], List[str]]:

        sovs = {t: RunningAverage() for t in teams}

        for team in teams:
            wins = results[team]["wins"]

            for event_id in wins:
                event = self.event_map[event_id]
                opposing_team = (
                    event.away_team_id
                    if event.home_team_id == team
                    else event.home_team_id
                )
                sovs[team].add(self.get_win_pct(results, opposing_team))
        sovs_new = {t: sovs[t].get_average() for t in teams}

        max_pct = max(sovs_new.values())
        winners = [t for t in teams if sovs_new[t] == max_pct]
        losers = [t for t in teams if sovs_new[t] != max_pct]

        return winners, losers

    def get_strength_of_schedule(self, results, teams) -> tuple[List[str], List[str]]:

        sovs = {t: RunningAverage() for t in teams}

        for team in teams:
            events = (
                results[team]["wins"] + results[team]["losses"] + results[team]["ties"]
            )

            for event_id in events:
                event = self.event_map[event_id]
                opposing_team = (
                    event.away_team_id
                    if event.home_team_id == team
                    else event.home_team_id
                )
                sovs[team].add(self.get_win_pct(results, opposing_team))
        sovs_new = {t: sovs[t].get_average() for t in teams}

        max_pct = max(sovs_new.values())
        winners = [t for t in teams if sovs_new[t] == max_pct]
        losers = [t for t in teams if sovs_new[t] != max_pct]

        return winners, losers

    def get_conference_record_results(self, results, teams):
        conference = self.team_map[teams[0]].division.split(" ")[0]
        winners = []
        losers = []
        records = {t: 0.0 for t in teams}
        for team in teams:
            wins = results[team]["wins"]
            losses = results[team]["losses"]
            ties = results[team]["ties"]
            score = 0
            total_games = 0
            for win in wins:
                event = self.event_map[win]
                home_conference = self.team_map[event.home_team_id].division.split(" ")[
                    0
                ]
                away_conference = self.team_map[event.away_team_id].division.split(" ")[
                    0
                ]
                if home_conference == conference and away_conference == conference:
                    score += 1
                    total_games += 1
            for tie in ties:
                event = self.event_map[tie]
                home_conference = self.team_map[event.home_team_id].division.split(" ")[
                    0
                ]
                away_conference = self.team_map[event.away_team_id].division.split(" ")[
                    0
                ]
                if home_conference == conference and away_conference == conference:
                    score += 0.5
                    total_games += 1
            for loss in losses:
                event = self.event_map[loss]
                home_conference = self.team_map[event.home_team_id].division.split(" ")[
                    0
                ]
                away_conference = self.team_map[event.away_team_id].division.split(" ")[
                    0
                ]
                if home_conference == conference and away_conference == conference:
                    total_games += 1
            if total_games == 0:
                records[team] = 0
            else:
                records[team] = score / total_games

        max_pct = max(records.values())

        winners = [t for t in teams if records[t] == max_pct]
        losers = [t for t in teams if records[t] != max_pct]
        return winners, losers


async def run_season_simulation(*args) -> Optional[datetime]:
    now = datetime.now(timezone.utc)

    # simulate the season

    teams, events, odds = load_data()

    nfc_teams = set([team.id for team in teams if team.division.startswith("NFC")])
    afc_teams = set([team.id for team in teams if team.division.startswith("AFC")])

    nfc_east_teams = set([team.id for team in teams if team.division == "NFC East"])
    nfc_north_teams = set([team.id for team in teams if team.division == "NFC North"])
    nfc_south_teams = set([team.id for team in teams if team.division == "NFC South"])
    nfc_west_teams = set([team.id for team in teams if team.division == "NFC West"])
    afc_east_teams = set([team.id for team in teams if team.division == "AFC East"])
    afc_north_teams = set([team.id for team in teams if team.division == "AFC North"])
    afc_south_teams = set([team.id for team in teams if team.division == "AFC South"])
    afc_west_teams = set([team.id for team in teams if team.division == "AFC West"])

    team_map = {team.id: team for team in teams}
    event_map = {event.id: event for event in events}
    event_odds_map = {eo.event_id: eo for eo in odds}

    results = {
        team_id: {
            "win_conference": float(0),
            "win_division": 0,
            "make_playoffs": 0,
            "expected_wins": RunningAverage(),
            "wins": {w: 0 for w in range(0, 18)},
        }
        for team_id in team_map.keys()
    }

    simulation = NFLSimulation(teams, events, odds)

    for _ in range(N_SIMULATIONS):

        results_map = simulation.simulate_season()

        for team_id, team_results in results_map.items():
            n_wins = len(team_results["wins"])
            results[team_id]["wins"][n_wins] += 1
            results[team_id]["expected_wins"].add(len(team_results["wins"]))

        # need to compute the rankings

        nfc_east_winner = simulation.compute_rankings(
            results_map, list(nfc_east_teams), RankingType.DIVISION
        )[0]
        nfc_north_winner = simulation.compute_rankings(
            results_map, list(nfc_north_teams), RankingType.DIVISION
        )[0]
        nfc_south_winner = simulation.compute_rankings(
            results_map, list(nfc_south_teams), RankingType.DIVISION
        )[0]
        nfc_west_winner = simulation.compute_rankings(
            results_map, list(nfc_west_teams), RankingType.DIVISION
        )[0]
        afc_east_winner = simulation.compute_rankings(
            results_map, list(afc_east_teams), RankingType.DIVISION
        )[0]
        afc_north_winner = simulation.compute_rankings(
            results_map, list(afc_north_teams), RankingType.DIVISION
        )[0]
        afc_south_winner = simulation.compute_rankings(
            results_map, list(afc_south_teams), RankingType.DIVISION
        )[0]
        afc_west_winner = simulation.compute_rankings(
            results_map, list(afc_west_teams), RankingType.DIVISION
        )[0]

        nfc_conf_winner_rankings = simulation.compute_rankings(
            results_map,
            [nfc_east_winner, nfc_north_winner, nfc_south_winner, nfc_west_winner],
            RankingType.CONFERENCE,
        )
        afc_conf_winner_rankings = simulation.compute_rankings(
            results_map,
            [afc_east_winner, afc_north_winner, afc_south_winner, afc_west_winner],
            RankingType.CONFERENCE,
        )

        nfc_rankings = simulation.compute_rankings(
            results_map, list(nfc_teams), RankingType.CONFERENCE
        )
        nfc_wildcard_rankings = [
            team_id
            for team_id in nfc_rankings
            if not team_id in nfc_conf_winner_rankings
        ][:3]

        afc_rankings = simulation.compute_rankings(
            results_map, list(afc_teams), RankingType.CONFERENCE
        )
        afc_wildcard_rankings = [
            team_id
            for team_id in afc_rankings
            if not team_id in afc_conf_winner_rankings
        ][:3]

        nfc_final_rankings = nfc_conf_winner_rankings + nfc_wildcard_rankings
        afc_final_rankings = afc_conf_winner_rankings + afc_wildcard_rankings

        for i in range(7):

            results[nfc_final_rankings[i]]["make_playoffs"] += 1
            results[afc_final_rankings[i]]["make_playoffs"] += 1
            if i < 4:
                results[nfc_final_rankings[i]]["win_division"] += 1
                results[afc_final_rankings[i]]["win_division"] += 1

            if i == 0:
                results[nfc_final_rankings[i]]["win_conference"] += 1
                results[afc_final_rankings[i]]["win_conference"] += 1

    for team_id in team_map.keys():
        results[team_id]["make_playoffs"] /= N_SIMULATIONS
        results[team_id]["win_division"] /= N_SIMULATIONS
        results[team_id]["win_conference"] /= N_SIMULATIONS
        for i in results[team_id]["wins"].keys():
            results[team_id]["wins"][i] /= N_SIMULATIONS

    try:

        conn = pool.getconn()

        # 1) get simulation group

        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """select max(simulation_group) from nfl_season_simulation nss"""
            )

            db_results = cursor.fetchone()

            previous_simulation_group = int(db_results["max"])

        with conn.cursor() as cursor:

            for team_id, team_results in results.items():

                cursor.execute(
                    """
                    INSERT INTO nfl_season_simulation
                        (team_id, simulation_group, make_playoffs_probability, win_division_probability, win_conference_probability, n_simulations, expected_wins, expected_wins_std, win_total_probabilities)
                    VALUES
                        (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (simulation_group, team_id)
                    DO UPDATE SET
                        make_playoffs_probability = EXCLUDED.make_playoffs_probability,
                        win_division_probability = EXCLUDED.win_division_probability,
                        win_conference_probability = EXCLUDED.win_conference_probability,
                        n_simulations = EXCLUDED.n_simulations,
                        expected_wins = EXCLUDED.expected_wins,
                        expected_wins_std = EXCLUDED.expected_wins_std,
                        win_total_probabilities = EXCLUDED.win_total_probabilities,
                        created_at = CURRENT_TIMESTAMP;
                    """,
                    (
                        team_id,
                        previous_simulation_group + 1,
                        team_results["make_playoffs"],
                        team_results["win_division"],
                        team_results["win_conference"],
                        N_SIMULATIONS,
                        team_results["expected_wins"].get_average(),
                        team_results["expected_wins"].get_standard_deviation(),
                        json.dumps(team_results["wins"]),
                    ),
                )
            conn.commit()

    finally:
        pool.putconn(conn)

    return now + timedelta(hours=6)
