import { addDays } from "date-fns";
import { SEASON, seasonStart } from "./consts";
import { query } from "./db";
import { Event, EventOdds, Team } from "./types";

export const getWinProbability = (homeOdds: number, awayOdds: number) => {
    const totalOdds = homeOdds + awayOdds;

    const implied_home_prob = 1 / homeOdds;
    const implied_away_prob = 1 / awayOdds;

    const total = implied_away_prob + implied_home_prob;

    const homeWinProbability = implied_home_prob / total;
    const awayWinProbability = implied_away_prob / total;

    return { homeWinProbability, awayWinProbability };
};

export const getStartAndEndOfWeek = (week: number) => {
    const start = addDays(seasonStart, (week - 1) * 7);
    const end = addDays(start, 7);

    return { start, end };
};

export const getCurrentWeekRange = () => {
    const now = new Date();

    let week = 1;

    let start = new Date(seasonStart);
    let end = addDays(start, 7);

    while (now > end) {
        start = end;
        end = addDays(start, 7);
        week++;
    }

    return { week, start, end };
};

export const getCurrentWeekEventsWithOdds = async () => {
    const { week, start, end } = getCurrentWeekRange();

    const events = await query<
        Event & {
            home_name: string;
            away_name: string;
            home_odds: number;
            away_odds: number;
            odds_timestamp: Date;
        }
    >(
        `SELECT 
    e.*,
    ht.name as home_name,
    at.name as away_name,
    eo.away_odds as away_odds,
    eo.home_odds as home_odds,
    eo.timestamp as odds_timestamp
FROM 
    events e
LEFT JOIN 
    teams ht ON e.home_team_id = ht.id
LEFT JOIN 
    teams at ON e.away_team_id = at.id
LEFT JOIN 
    (
        SELECT 
            event_id, 
            away_odds,
            home_odds,
            timestamp,
            ROW_NUMBER() OVER (PARTITION BY event_id ORDER BY timestamp DESC) as rn
        FROM 
            event_odds
    ) eo ON e.id = eo.event_id AND eo.rn = 1
            where e.commence_time between $1 and $2
            `,
        [start, end]
    );

    return events;
};

export const getEvent = async (eventId: string) => {
    const event = await query<
        Event & {
            home_name: string;
            away_name: string;
        }
    >(
        `select 
            e.*,
            ht.name as home_name,
            at.name as away_name 
        from events e
        LEFT JOIN 
            teams ht ON e.home_team_id = ht.id
        LEFT JOIN 
            teams at ON e.away_team_id = at.id 
        where e.id = $1`,
        [eventId]
    );

    return event[0];
};

export const getEventOdds = async (eventId: string) => {
    const eventOdds = await query<EventOdds>(
        `select * from event_odds eo WHERE event_id = $1`,
        [eventId]
    );

    return eventOdds;
};

export const getAllEvents = async () => {
    const events = await query<Event>(
        `select * from events where season = $1`,
        [SEASON]
    );

    return events;
};

export const getAllEventsWithNames = async () => {
    const events = await query<
        Event & {
            home_name: string;
            away_name: string;
        }
    >(
        `select 
            e.*,
            ht.name as home_name,
            at.name as away_name 
        from events e
        LEFT JOIN 
            teams ht ON e.home_team_id = ht.id
        LEFT JOIN 
            teams at ON e.away_team_id = at.id 
        `,
        []
    );

    return events;
};

export const getAllLatestEventOdds = async () => {
    const results = await query<{
        event_id: string;
        home_odds_ema: number;
        away_odds_ema: number;
        latest_timestamp: Date;
    }>(
        `WITH latest_odds AS (
    SELECT 
      event_id,
      home_odds,
      away_odds,
      timestamp,
      ROW_NUMBER() OVER (PARTITION BY event_id ORDER BY timestamp DESC) as rn
    FROM 
      event_odds
  ),
  ema_calc AS (
    SELECT 
      event_id,
      home_odds,
      away_odds,
      timestamp,
      EXP(SUM(LN(0.2)) OVER (PARTITION BY event_id ORDER BY timestamp DESC ROWS BETWEEN CURRENT ROW AND 9 FOLLOWING)) as weight
    FROM 
      latest_odds
    WHERE 
      rn <= 10
  )
  SELECT 
    event_id,
    MAX(timestamp) as latest_timestamp,
    SUM(home_odds * weight) / SUM(weight) as home_odds_ema,
    SUM(away_odds * weight) / SUM(weight) as away_odds_ema
  FROM 
    ema_calc
  GROUP BY 
    event_id`,
        []
    );

    return results;
};

export const getAllTeams = async () => {
    const teams = await query<Team>(`select * from teams where season = $1`, [
        SEASON,
    ]);

    return teams;
};
