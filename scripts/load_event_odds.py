import json
import os
from datetime import datetime, timezone
from uuid import uuid4

import psycopg2
from average import RunningAverage
from dotenv import load_dotenv

# connect to pg database

load_dotenv()

dbname = os.getenv("DB_DATABASE")
user = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")
host = os.getenv("DB_HOST")
port = os.getenv("DB_PORT")

print(dbname, user, password, host, port)


conn = psycopg2.connect(
    dbname=dbname, user=user, password=password, host=host, port=port
)

cur = conn.cursor()


# get the teams file

cwd = os.getcwd()


def get_all_game_odds():

    data = []

    files = os.listdir(cwd + "/src/data/odds")

    for file in files:
        with open(f"{cwd + '/src/data/odds'}/{file}", "r") as infile:
            data.append(json.load(infile))

    # sort the data by the start time of the game

    data = sorted(data, key=lambda game: game["commence_time"])

    return data


game_odds = get_all_game_odds()

cur.execute("SELECT * FROM teams")

teams = cur.fetchall()


def get_team_id(team_name):
    team = next((team for team in teams if team[1] == team_name), None)
    return team[0] if team else None


for game in game_odds:

    event_id = game["id"]

    home_team = game["home_team"]
    away_team = game["away_team"]

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
                if outcome["name"] == home_team:
                    home_avg.add(outcome["price"])
                elif outcome["name"] == away_team:
                    away_avg.add(outcome["price"])

    home_team_id = get_team_id(home_team)
    away_team_id = get_team_id(away_team)

    rand_id = uuid4().hex

    now = datetime.now(tz=timezone.utc)

    cur.execute(
        "INSERT INTO event_odds (id, event_id, timestamp, home_odds, away_odds) VALUES (%s, %s, %s, %s, %s)",
        (rand_id, event_id, now, home_avg.get_average(), away_avg.get_average()),
    )

conn.commit()
