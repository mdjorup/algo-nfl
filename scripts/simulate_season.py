import json
import os
import random
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from functools import cmp_to_key
from typing import List
from uuid import uuid4

import psycopg2
from average import RunningAverage
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor
from tqdm import tqdm

load_dotenv()

CURRENT_SEASON = "2024"
SIMULATION_GROUP = 2
N_SIMULATIONS = 100000

dbname = os.getenv("DB_DATABASE")
user = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")
host = os.getenv("DB_HOST")
port = os.getenv("DB_PORT")


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


def load_teams() -> List[Team]:

    ret_teams = []

    env = os.getenv("ENV")
    if env == "prod":

        conn = psycopg2.connect(
            dbname=dbname, user=user, password=password, host=host, port=port
        )

        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Execute a query
            cursor.execute("SELECT * FROM teams where season = %s", (CURRENT_SEASON,))

            teams = cursor.fetchall()

        conn.close()

        for team in teams:
            new_team = Team(
                team["id"],
                team["name"],
                team["division"],
                team["season"],
                team["wins"],
                team["losses"],
                team["ties"],
            )
            ret_teams.append(new_team)
    else:

        cwd = os.getcwd()

        with open(cwd + "/data/teams.json") as file:
            teams_raw = json.load(file)

        for team in teams_raw:

            name = team["name"]
            division = team["division"]
            season = team["season"]

            id = season + "_" + "_".join(name.split(" "))

            new_team = Team(id, name, division, season, 0, 0, 0)
            ret_teams.append(new_team)

    return ret_teams


def load_events(teams: List[Team]) -> List[Event]:

    ret_events = []

    env = os.getenv("ENV")
    if env == "prod":

        conn = psycopg2.connect(
            dbname=dbname, user=user, password=password, host=host, port=port
        )

        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Execute a query
            cursor.execute("SELECT * FROM events where season = %s", (CURRENT_SEASON,))

            events = cursor.fetchall()

        conn.close()

        for event in events:
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
            ret_events.append(new_event)
    else:

        cwd = os.getcwd()

        with open(cwd + "/data/events.json") as file:
            events = json.load(file)

        for event in events:
            id = str(event["id"])
            home_team_name = event["home_team"]
            away_team_name = event["away_team"]
            commence_time = datetime.fromisoformat(event["commence_time"])

            home_team: Team = next(
                (team for team in teams if team.name == home_team_name)
            )
            away_team: Team = next(
                (team for team in teams if team.name == away_team_name)
            )

            new_event = Event(
                id, "2024", home_team.id, away_team.id, commence_time, False, 0, 0
            )

            ret_events.append(new_event)

    return ret_events


def load_event_odds(teams: List[Team]) -> List[EventOdds]:

    ret_event_odds = []

    env = os.getenv("ENV")
    if env == "prod":

        conn = psycopg2.connect(
            dbname=dbname, user=user, password=password, host=host, port=port
        )

        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Execute a query
            cursor.execute(
                """SELECT DISTINCT ON (event_id) * FROM public.event_odds ORDER BY event_id, "timestamp" DESC;"""
            )

            event_odds = cursor.fetchall()

        conn.close()

        for event_odd in event_odds:
            new_event = EventOdds(
                event_odd["id"],
                event_odd["event_id"],
                event_odd["timestamp"],
                event_odd["home_odds"],
                event_odd["away_odds"],
            )

            ret_event_odds.append(new_event)
    else:

        cwd = os.getcwd()

        files = os.listdir(cwd + "/data/odds")

        data = []

        for file in files:
            with open(f"{cwd}/data/odds/{file}", "r") as infile:
                data.append(json.load(infile))

        data = sorted(data, key=lambda game: game["commence_time"])

        for game in data:

            event_id = game["id"]

            home_team_name = game["home_team"]
            away_team_name = game["away_team"]

            home_avg = RunningAverage()
            away_avg = RunningAverage()

            bookmakers = game["bookmakers"]

            for bookmaker in bookmakers:
                markets = bookmaker["markets"]

                for market in markets:
                    if market["key"] != "h2h":
                        continue

                    outcomes = market["outcomes"]

                    for outcome in outcomes:
                        if outcome["name"] == home_team_name:
                            home_avg.add(outcome["price"])
                        elif outcome["name"] == away_team_name:
                            away_avg.add(outcome["price"])

            rand_id = uuid4().hex
            now = datetime.now(tz=timezone.utc)

            new_event_odds = EventOdds(
                rand_id, event_id, now, home_avg.get_average(), away_avg.get_average()
            )

            ret_event_odds.append(new_event_odds)

    return ret_event_odds


def load_data():

    teams = load_teams()

    events = load_events(teams)

    event_odds = load_event_odds(teams)

    return teams, events, event_odds


teams, events, event_odds = load_data()

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
event_odds_map = {eo.event_id: eo for eo in event_odds}


def compute_win_prob(home_odds: float, away_odds: float):

    implied_home_prob = 1 / home_odds
    implied_away_prob = 1 / away_odds
    total = implied_home_prob + implied_away_prob

    home_win_prob = implied_home_prob / total
    away_win_prob = implied_away_prob / total

    return home_win_prob, away_win_prob


def compare_fn(results, team_id_1, team_id_2):

    # return -1 if team_id_1 wins, 1 if team_id_2 wins

    team_1_results = results[team_id_1]
    team_2_results = results[team_id_2]

    team_1_wins = len(team_1_results["wins"])
    team_2_wins = len(team_2_results["wins"])

    # just by wins

    if team_1_wins > team_2_wins:
        return -1
    elif team_2_wins > team_1_wins:
        return 1

    conf_teams = (
        nfc_teams if team_map[team_id_1].division.startswith("NFC") else afc_teams
    )

    # team_1 division games

    team_1_division_wins = len(
        [
            eid
            for eid in team_1_results["wins"]
            if event_map[eid].away_team_id in conf_teams
            and event_map[eid].home_team_id in conf_teams
        ]
    )
    team_1_division_losses = len(
        [
            eid
            for eid in team_1_results["losses"]
            if event_map[eid].away_team_id in conf_teams
            and event_map[eid].home_team_id in conf_teams
        ]
    )
    team_1_division_pct = team_1_division_wins / (
        team_1_division_wins + team_1_division_losses
    )

    team_2_division_wins = len(
        [
            eid
            for eid in team_2_results["wins"]
            if event_map[eid].away_team_id in conf_teams
            and event_map[eid].home_team_id in conf_teams
        ]
    )
    team_2_division_losses = len(
        [
            eid
            for eid in team_2_results["losses"]
            if event_map[eid].away_team_id in conf_teams
            and event_map[eid].home_team_id in conf_teams
        ]
    )
    team_2_division_pct = team_2_division_wins / (
        team_2_division_wins + team_2_division_losses
    )

    if team_1_division_pct > team_2_division_pct:
        return -1
    elif team_2_division_pct > team_1_division_pct:
        return 1

    return 0


class RankingType(Enum):
    DIVISION = 1
    CONFERENCE = 2


def get_wins(results, team_id):
    return len(results[team_id]["wins"]) + (len(results[team_id]["ties"]) / 2)


def get_win_pct(results, team_id):
    wins = len(results[team_id]["wins"])
    losses = len(results[team_id]["losses"])
    ties = len(results[team_id]["ties"])
    return (wins + ties / 2) / (wins + losses + ties)


def rank_by_wins(results, t1_id, t2_id):
    team_1_wins = get_wins(results, t1_id)
    team_2_wins = get_wins(results, t2_id)
    if team_1_wins > team_2_wins:
        return -1
    elif team_2_wins > team_1_wins:
        return 1
    else:
        return 0


def get_h2h_winner(results, teams):

    teams_set = set(teams)

    team_h2h_win_pct = {t: 0.0 for t in teams}

    for team in teams:
        wins = results[team]["wins"]
        losses = results[team]["losses"]
        ties = results[team]["ties"]
        win_total = 0
        total_games = 0
        for win in wins:
            event = event_map[win]
            if event.home_team_id in teams_set and event.away_team_id in teams_set:
                win_total += 1
                total_games += 1
        for tie in ties:
            event = event_map[tie]
            if event.home_team_id in teams_set and event.away_team_id in teams_set:
                win_total += 0.5
                total_games += 1
        for loss in losses:
            event = event_map[loss]
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


def get_conference_record_results(results, teams):
    conference = team_map[teams[0]].division.split(" ")[0]
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
            event = event_map[win]
            home_conference = team_map[event.home_team_id].division.split(" ")[0]
            away_conference = team_map[event.away_team_id].division.split(" ")[0]
            if home_conference == conference and away_conference == conference:
                score += 1
                total_games += 1
        for tie in ties:
            event = event_map[tie]
            home_conference = team_map[event.home_team_id].division.split(" ")[0]
            away_conference = team_map[event.away_team_id].division.split(" ")[0]
            if home_conference == conference and away_conference == conference:
                score += 0.5
                total_games += 1
        for loss in losses:
            event = event_map[loss]
            home_conference = team_map[event.home_team_id].division.split(" ")[0]
            away_conference = team_map[event.away_team_id].division.split(" ")[0]
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

    return


def get_strength_of_victory(results, teams) -> tuple[List[str], List[str]]:

    sovs = {t: RunningAverage() for t in teams}

    for team in teams:
        wins = results[team]["wins"]

        for event_id in wins:
            event = event_map[event_id]
            opposing_team = (
                event.away_team_id if event.home_team_id == team else event.home_team_id
            )
            sovs[team].add(get_win_pct(results, opposing_team))
    sovs_new = {t: sovs[t].get_average() for t in teams}

    max_pct = max(sovs_new.values())
    winners = [t for t in teams if sovs_new[t] == max_pct]
    losers = [t for t in teams if sovs_new[t] != max_pct]

    return winners, losers


def get_strength_of_schedule(results, teams) -> tuple[List[str], List[str]]:

    sovs = {t: RunningAverage() for t in teams}

    for team in teams:
        events = results[team]["wins"] + results[team]["losses"] + results[team]["ties"]

        for event_id in events:
            event = event_map[event_id]
            opposing_team = (
                event.away_team_id if event.home_team_id == team else event.home_team_id
            )
            sovs[team].add(get_win_pct(results, opposing_team))
    sovs_new = {t: sovs[t].get_average() for t in teams}

    max_pct = max(sovs_new.values())
    winners = [t for t in teams if sovs_new[t] == max_pct]
    losers = [t for t in teams if sovs_new[t] != max_pct]

    return winners, losers


def get_division_win_pct(results, team_id):
    division = team_map[team_id].division
    wins = results[team_id]["wins"]
    losses = results[team_id]["losses"]
    ties = results[team_id]["ties"]

    total_games = len(wins) + len(losses) + len(ties)
    division_wins = len(
        [
            eid
            for eid in wins
            if event_map[eid].home_team_id in division
            and event_map[eid].away_team_id in division
        ]
    )
    division_ties = len(
        [
            eid
            for eid in ties
            if event_map[eid].home_team_id in division
            and event_map[eid].away_team_id in division
        ]
    )
    score = division_wins + division_ties / 2
    return score / total_games


def get_points_ranking(results, teams, conference=True) -> tuple[List[str], List[str]]:

    ps = {}
    pa = {}

    for event in event_map.values():
        home_team_id = event.home_team_id
        away_team_id = event.away_team_id
        if home_team_id not in ps:
            ps[home_team_id] = 0
            pa[home_team_id] = 0
        if away_team_id not in ps:
            ps[away_team_id] = 0
            pa[away_team_id] = 0

        ps[home_team_id] += event.home_score
        pa[home_team_id] += event.away_score
        ps[away_team_id] += event.away_score
        pa[away_team_id] += event.home_score

    if conference:
        conference_teams = (
            nfc_teams if team_map[teams[0]].division.startswith("NFC") else afc_teams
        )
        ps = {t: ps[t] for t in teams if t in conference_teams}
        pa = {t: pa[t] for t in teams if t in conference_teams}

    # rank each ps and pa
    ps_sorted = sorted(ps.items(), key=lambda item: item[1], reverse=True)
    ps_ranked = {key: rank + 1 for rank, (key, _) in enumerate(ps_sorted)}

    pa_sorted = sorted(ps.items(), key=lambda item: -1 * item[1], reverse=True)
    pa_ranked = {key: rank + 1 for rank, (key, _) in enumerate(pa_sorted)}

    team_rank_score = {t: ps_ranked[t] + pa_ranked[t] for t in teams}

    min_rank = min(team_rank_score.values())

    winners = [t for t in teams if team_rank_score[t] == min_rank]
    losers = [t for t in teams if team_rank_score[t] != min_rank]

    return winners, losers


def get_common_opponents(results, teams) -> List[str]:

    teams_set = set(teams)

    team_opponents = {}

    for team in teams:
        team_opponents[team] = set()
        res = results[team]
        games = res["wins"] + res["losses"] + res["ties"]
        for event_id in games:
            event = event_map[event_id]
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


def break_division_tie(results, teams) -> tuple[str, List[str]]:
    # TODO: Implement

    # return a winning team, losing teams
    if len(teams) == 1:
        return teams[0], teams[1:]
    elif len(teams) == 2:

        # print(f"1) Head to Head between {', '.join([team_map[t].name for t in teams])}")
        # 1) head to head
        h2h_winners, h2h_losers = get_h2h_winner(results, teams)
        if len(h2h_winners) == 1:
            return h2h_winners[0], h2h_losers

        # 2) division record
        # print(
        #     f"2) Division Record between {', '.join([team_map[t].name for t in teams])}"
        # )

        t1_division_win_pct = get_division_win_pct(results, teams[0])
        t2_division_win_pct = get_division_win_pct(results, teams[1])
        if t1_division_win_pct > t2_division_win_pct:
            return teams[0], [teams[1]]
        elif t2_division_win_pct > t1_division_win_pct:
            return teams[1], [teams[0]]

        # 3) common opponents
        # print(f"3) Common Opponents {', '.join([team_map[t].name for t in teams])}")

        common_opponents = get_common_opponents(results, teams)

        if len(common_opponents) > 0:
            common_opponents_set = set(common_opponents)

            common_opponent_wins = {t: 0.0 for t in teams}
            for team in teams:
                common_wins = results[team]["wins"]
                common_ties = results[team]["ties"]

                for event_id in common_wins:
                    event = event_map[event_id]
                    if (
                        event.home_team_id in common_opponents_set
                        or event.away_team_id in common_opponents_set
                    ):
                        common_opponent_wins[team] += 1
                for event_id in common_ties:
                    event = event_map[event_id]
                    if (
                        event.home_team_id in common_opponents_set
                        or event.away_team_id in common_opponents_set
                    ):
                        common_opponent_wins[team] += 0.5
            max_wins = max(common_opponent_wins.values())
            winning_teams = [t for t in teams if common_opponent_wins[t] == max_wins]
            if len(winning_teams) == 1:
                return winning_teams[0], [t for t in teams if t != winning_teams[0]]

        # 4) conference record

        # print(f"4) Conference Record {', '.join([team_map[t].name for t in teams])}")

        conference_winners, conference_losers = get_conference_record_results(
            results, teams
        )
        if len(conference_winners) == 1:
            return conference_winners[0], conference_losers

        #  5) strength of victory

        # print(f"5) Strength of Victory {', '.join([team_map[t].name for t in teams])}")

        sov_winners, sov_losers = get_strength_of_victory(results, teams)
        if len(sov_winners) == 1:
            return sov_winners[0], sov_losers

        # 6) strength of schedule
        # print(f"6) Strength of Schedule {', '.join([team_map[t].name for t in teams])}")

        sos_winners, sos_losers = get_strength_of_schedule(results, teams)
        if len(sos_winners) == 1:
            return sos_winners[0], sos_losers

        # # 7) sum of points allowed and points scored conference rankings
        # print(
        #     f"6) Conference Points Ranking {', '.join([team_map[t].name for t in teams])}"
        # )

        # points_ranking_conference_winners, points_ranking_conference_losers = (
        #     get_points_ranking(results, teams, conference=True)
        # )
        # if len(points_ranking_conference_winners) == 1:
        #     return (
        #         points_ranking_conference_winners[0],
        #         points_ranking_conference_losers,
        #     )

        # print(f"6) All Points Ranking {', '.join([team_map[t].name for t in teams])}")

        # # 8) sum of points allowed and points scored overall rankings
        # points_ranking_winners, points_ranking_losers = get_points_ranking(
        #     results, teams, conference=False
        # )
        # if len(points_ranking_winners) == 1:
        #     return points_ranking_winners[0], points_ranking_losers

        # TODO: 9) net points in common games

        # TODO: 10) net points in all games

        return teams[0], teams[1:]
    elif len(teams) >= 3:

        # 3 or more team tiebreaker
        return teams[0], teams[1:]

    else:
        return teams[0], teams[1:]


def break_conference_tie(results, teams):
    # TODO: Implement
    # return a winning team, losing teams
    if len(teams) == 1:
        return teams[0], []
    elif len(teams) == 2:
        # head to head

        # 1) head to head
        # print("1) Head to Head")
        h2h_winners, h2h_losers = get_h2h_winner(results, teams)
        if len(h2h_winners) == 1:
            return h2h_winners[0], h2h_losers

        teams = h2h_winners

        # print("2) Conference WLT ")

        return teams[0], teams[1:]
    elif len(teams) >= 3:
        # 3 or more team tiebreaker
        return teams[0], teams[1:]
    else:
        return teams[0], teams[1:]


def break_tie(results, teams, ranking_type: RankingType) -> List[str]:
    # TODO: this is the function that will break the team ties
    if len(teams) == 1:
        return teams

    if ranking_type == RankingType.DIVISION:
        winner, losers = break_division_tie(results, teams)
        return [winner] + break_tie(results, losers, ranking_type)
    elif ranking_type == RankingType.CONFERENCE:
        winner, losers = break_conference_tie(results, teams)
        return [winner] + break_tie(results, losers, ranking_type)

    # default to just the teams. This should never happen though
    return teams


def compute_rankings(
    results, team_ids: List[str], ranking_type: RankingType = RankingType.DIVISION
) -> List[str]:

    final_ranking = []

    teams_sorted_by_wins = sorted(
        team_ids, key=cmp_to_key(lambda t1, t2: rank_by_wins(results, t1, t2))
    )

    latest_wins = -1
    current_win_list = []

    for t in teams_sorted_by_wins:
        wins = get_wins(results, t)
        if wins == latest_wins:
            current_win_list.append(t)
        else:
            if len(current_win_list) > 0:

                ranked_order = break_tie(results, current_win_list, ranking_type)
                final_ranking.extend(ranked_order)
                current_win_list = []

            current_win_list.append(t)
            latest_wins = wins
    else:
        final_ranking.extend(current_win_list)

    teams_sorted = sorted(
        team_ids, key=cmp_to_key(lambda t1, t2: compare_fn(results, t1, t2))
    )

    return teams_sorted


def simulate_season():

    results_map = {}  # maps team_id: {wins: [event_ids], losses: [event_ids]}

    for team_id in team_map.keys():
        results_map[team_id] = {"wins": [], "losses": [], "ties": []}

    for _, event in event_map.items():

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

        event_odd = event_odds_map[event.id]

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

    # now to do the rankings: 1-7, where the first 4 are the division winners

    nfc_team_ids = list(nfc_teams)
    afc_team_ids = list(afc_teams)

    nfc_east_winner = compute_rankings(
        results_map, list(nfc_east_teams), RankingType.DIVISION
    )[0]
    nfc_north_winner = compute_rankings(
        results_map, list(nfc_north_teams), RankingType.DIVISION
    )[0]
    nfc_south_winner = compute_rankings(
        results_map, list(nfc_south_teams), RankingType.DIVISION
    )[0]
    nfc_west_winner = compute_rankings(
        results_map, list(nfc_west_teams), RankingType.DIVISION
    )[0]
    afc_east_winner = compute_rankings(
        results_map, list(afc_east_teams), RankingType.DIVISION
    )[0]
    afc_north_winner = compute_rankings(
        results_map, list(afc_north_teams), RankingType.DIVISION
    )[0]
    afc_south_winner = compute_rankings(
        results_map, list(afc_south_teams), RankingType.DIVISION
    )[0]
    afc_west_winner = compute_rankings(
        results_map, list(afc_west_teams), RankingType.DIVISION
    )[0]

    nfc_conf_winner_rankings = compute_rankings(
        results_map,
        [nfc_east_winner, nfc_north_winner, nfc_south_winner, nfc_west_winner],
        RankingType.CONFERENCE,
    )
    afc_conf_winner_rankings = compute_rankings(
        results_map,
        [afc_east_winner, afc_north_winner, afc_south_winner, afc_west_winner],
        RankingType.CONFERENCE,
    )

    nfc_rankings = compute_rankings(results_map, nfc_team_ids, RankingType.CONFERENCE)
    nfc_wildcard_rankings = [
        team_id for team_id in nfc_rankings if not team_id in nfc_conf_winner_rankings
    ][:3]

    afc_rankings = compute_rankings(results_map, afc_team_ids, RankingType.CONFERENCE)
    afc_wildcard_rankings = [
        team_id for team_id in afc_rankings if not team_id in afc_conf_winner_rankings
    ][:3]

    return (
        nfc_conf_winner_rankings + nfc_wildcard_rankings,
        afc_conf_winner_rankings + afc_wildcard_rankings,
        results_map,
    )


def simulate_n(n_simulations=1000):

    results = {
        team_id: {
            "win_conference": float(0),
            "win_division": 0,
            "make_playoffs": 0,
            "expected_wins": RunningAverage(),
        }
        for team_id in team_map.keys()
    }

    for i in tqdm(range(n_simulations)):

        nfc_rankings, afc_rankings, results_map = simulate_season()

        for team_id, team_results in results_map.items():
            results[team_id]["expected_wins"].add(len(team_results["wins"]))

        for i in range(7):

            results[nfc_rankings[i]]["make_playoffs"] += 1
            results[afc_rankings[i]]["make_playoffs"] += 1

            if i < 4:
                results[nfc_rankings[i]]["win_division"] += 1
                results[afc_rankings[i]]["win_division"] += 1

            if i == 0:
                results[nfc_rankings[i]]["win_conference"] += 1
                results[afc_rankings[i]]["win_conference"] += 1

    for team_id in team_map.keys():
        results[team_id]["make_playoffs"] /= n_simulations
        results[team_id]["win_division"] /= n_simulations
        results[team_id]["win_conference"] /= n_simulations

    return results


def run_and_update():

    results = simulate_n(N_SIMULATIONS)

    conn = psycopg2.connect(
        dbname=dbname, user=user, password=password, host=host, port=port
    )

    with conn.cursor() as cursor:

        for team_id, team_results in results.items():
            print(
                f"{team_id}: {team_results['make_playoffs']} - {team_results['win_division']} - {team_results['win_conference']} -- {team_results['expected_wins'].get_average()} / {team_results['expected_wins'].get_standard_deviation()} Expected Wins"
            )

            cursor.execute(
                """
                INSERT INTO nfl_season_simulation
                    (team_id, simulation_group, make_playoffs_probability, win_division_probability, win_conference_probability, n_simulations, expected_wins, expected_wins_std)
                VALUES
                    (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (simulation_group, team_id)
                DO UPDATE SET
                    make_playoffs_probability = EXCLUDED.make_playoffs_probability,
                    win_division_probability = EXCLUDED.win_division_probability,
                    win_conference_probability = EXCLUDED.win_conference_probability,
                    n_simulations = EXCLUDED.n_simulations,
                    expected_wins = EXCLUDED.expected_wins,
                    expected_wins_std = EXCLUDED.expected_wins_std,
                    created_at = CURRENT_TIMESTAMP;
                """,
                (
                    team_id,
                    SIMULATION_GROUP,
                    team_results["make_playoffs"],
                    team_results["win_division"],
                    team_results["win_conference"],
                    N_SIMULATIONS,
                    team_results["expected_wins"].get_average(),
                    team_results["expected_wins"].get_standard_deviation(),
                ),
            )

        input("Press Enter to save results...")

        conn.commit()

    conn.close()


# run_and_update()

results = run_and_update()
