import json
import os
from uuid import uuid4

import psycopg2
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


# get the teams file

cwd = os.getcwd()

with open(cwd + "/data/events.json") as file:
    events = json.load(file)

# insert the teams into the database if the team name and season does not exist

cur = conn.cursor()
season = "2024"

cur.execute("SELECT * FROM teams")

teams = cur.fetchall()

for event in events:
    id = str(event["id"])
    home_team_name = event["home_team"]
    away_team_name = event["away_team"]
    commence_time = event["commence_time"]

    print(id)

    home_team = next((team for team in teams if team[1] == home_team_name), None)
    away_team = next((team for team in teams if team[1] == away_team_name), None)

    home_team_id = home_team[0] if home_team else None
    away_team_id = away_team[0] if away_team else None

    cur.execute(
        "SELECT * FROM events WHERE id = %s",
        (id,),
    )

    if cur.fetchone():
        continue

    print((id, home_team_id, away_team_id, commence_time, season))

    cur.execute(
        "INSERT INTO events (id, home_team_id, away_team_id, commence_time, season) VALUES (%s, %s, %s, %s, %s)",
        (id, home_team_id, away_team_id, commence_time, season),
    )


conn.commit()
