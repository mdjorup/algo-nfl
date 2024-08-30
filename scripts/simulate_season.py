import json
import os
import random
from dataclasses import dataclass
from datetime import datetime, timezone
from functools import cmp_to_key
from time import time
from typing import List
from uuid import uuid4

from average import RunningAverage
from dotenv import load_dotenv

load_dotenv()


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
        pass
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
        pass
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

    event_odds = []

    env = os.getenv("ENV")
    if env == "prod":
        pass
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

            home_team: Team = next(
                (team for team in teams if team.name == home_team_name)
            )
            away_team: Team = next(
                (team for team in teams if team.name == away_team_name)
            )

            rand_id = uuid4().hex
            now = datetime.now(tz=timezone.utc)

            new_event_odds = EventOdds(
                rand_id, event_id, now, home_avg.get_average(), away_avg.get_average()
            )

            event_odds.append(new_event_odds)

    return event_odds


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
event_odds_map = {eo.id: eo for eo in event_odds}


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


def compute_rankings(results, team_ids: List[str], n=1) -> List[str]:

    teams_sorted = sorted(
        team_ids, key=cmp_to_key(lambda t1, t2: compare_fn(results, t1, t2))
    )

    return teams_sorted[:n]


def simulate_season():

    results_map = {}  # maps team_id: {wins: [event_ids], losses: [event_ids]}

    for team_id in team_map.keys():
        results_map[team_id] = {"wins": [], "losses": []}

    for _, event_odd in event_odds_map.items():

        event = event_map[event_odd.event_id]

        home_team_id = event.home_team_id
        away_team_id = event.away_team_id

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

    nfc_east_winner = compute_rankings(results_map, list(nfc_east_teams))[0]
    nfc_north_winner = compute_rankings(results_map, list(nfc_north_teams))[0]
    nfc_south_winner = compute_rankings(results_map, list(nfc_south_teams))[0]
    nfc_west_winner = compute_rankings(results_map, list(nfc_west_teams))[0]
    afc_east_winner = compute_rankings(results_map, list(afc_east_teams))[0]
    afc_north_winner = compute_rankings(results_map, list(afc_north_teams))[0]
    afc_south_winner = compute_rankings(results_map, list(afc_south_teams))[0]
    afc_west_winner = compute_rankings(results_map, list(afc_west_teams))[0]

    nfc_conf_winner_rankings = compute_rankings(
        results_map,
        [nfc_east_winner, nfc_north_winner, nfc_south_winner, nfc_west_winner],
        4,
    )
    afc_conf_winner_rankings = compute_rankings(
        results_map,
        [afc_east_winner, afc_north_winner, afc_south_winner, afc_west_winner],
        4,
    )

    nfc_rankings = compute_rankings(results_map, nfc_team_ids, 7)
    nfc_wildcard_rankings = [
        team_id for team_id in nfc_rankings if not team_id in nfc_conf_winner_rankings
    ][:3]

    afc_rankings = compute_rankings(results_map, afc_team_ids, 7)
    afc_wildcard_rankings = [
        team_id for team_id in afc_rankings if not team_id in afc_conf_winner_rankings
    ][:3]

    return (
        nfc_conf_winner_rankings + nfc_wildcard_rankings,
        afc_conf_winner_rankings + afc_wildcard_rankings,
    )


results = {
    team_id: {"win_conference": 0, "win_division": 0, "make_playoffs": 0}
    for team_id in team_map.keys()
}


n_simulations = 100000

t0 = time()

for _ in range(n_simulations):

    nfc_rankings, afc_rankings = simulate_season()

    for i in range(7):

        results[nfc_rankings[i]]["make_playoffs"] += 1
        results[afc_rankings[i]]["make_playoffs"] += 1

        if i < 4:
            results[nfc_rankings[i]]["win_division"] += 1
            results[afc_rankings[i]]["win_division"] += 1

        if i == 0:
            results[nfc_rankings[i]]["win_conference"] += 1
            results[afc_rankings[i]]["win_conference"] += 1

t1 = time()

print(f"Ran {n_simulations} simulations in {t1-t0} seconds")


with open("results.csv", "w") as outfile:

    lines = [
        ",".join(["team", "make_playoffs_prob", "win_division_prob", "win_conf_prob"])
        + "\n"
    ]

    for team, result in results.items():

        make_playoffs_prob = result["make_playoffs"] / n_simulations
        win_division_prob = result["win_division"] / n_simulations
        win_conf_prob = result["win_conference"] / n_simulations

        lines.append(
            ",".join(
                [
                    team,
                    str(make_playoffs_prob),
                    str(win_division_prob),
                    str(win_conf_prob),
                ]
            )
            + "\n"
        )

        print(f"{team}: {win_conf_prob} - {win_division_prob} - {make_playoffs_prob}")

    outfile.writelines(lines)
