-- Create the tables

CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    division VARCHAR(255) NOT NULL,
    season VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(255) PRIMARY KEY,
    season VARCHAR(255) NOT NULL,
    home_team_id UUID REFERENCES teams(id),
    away_team_id UUID REFERENCES teams(id),
    commence_time TIMESTAMPTZ NOT NULL,
    completed BOOLEAN NOT NULL default false,
    home_score INTEGER,
    away_score INTEGER
);

CREATE TABLE IF NOT EXISTS event_odds (
    id UUID PRIMARY KEY,
    event_id VARCHAR(255) REFERENCES events(id),
    timestamp TIMESTAMP NOT NULL,
    home_odds NUMERIC(10, 2) NOT NULL,
    away_odds NUMERIC(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS ranking_sets (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS rankings (
    id UUID PRIMARY KEY,
    ranking_set_id UUID REFERENCES ranking_sets(id),
    team UUID REFERENCES teams(id),
    rank INTEGER CHECK (rank >= 1 AND rank <= 32) NOT NULL,
    description TEXT
);