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

with open(cwd + "/data/teams.json") as file:
    teams = json.load(file)

# insert the teams into the database if the team name and season does not exist

cur = conn.cursor()

for team in teams:

    cur.execute(
        "SELECT * FROM teams WHERE name = %s AND season = %s",
        (team["name"], team["season"]),
    )

    if cur.fetchone():
        continue

    id = uuid4().hex
    cur.execute(
        "INSERT INTO teams (id, name, division, season) VALUES (%s, %s, %s, %s)",
        (id, team["name"], team["division"], team["season"]),
    )

conn.commit()
