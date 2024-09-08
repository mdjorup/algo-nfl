import { query } from "@/lib/db";
import { getAllEventsWithNames, getCurrentWeekRange } from "@/lib/dbFns";
import { redirect } from "next/navigation";


const getAllLatestEventOdds = async () => {

  const results = await query<{
    event_id: string,
    home_odds_ema: number,
    away_odds_ema: number,
  }>(`WITH latest_odds AS (
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
  event_id`, [])

  return results;
}


const Home = async () => {

  redirect("/games")

  const { week, start, end } = getCurrentWeekRange()





  const odds = await getAllLatestEventOdds();
  const events = await getAllEventsWithNames();





  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {`Week ${week} Games`}
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* {eventsWithOdds.sort((e1, e2) => isBefore(e1.commence_time, e2.commence_time) ? -1 : 1).map((e, i) => (
          <Game key={i} event_id={e.id} home_team={e.home_name} away_team={e.away_name} commence_time={e.commence_time} complete={e.completed} home_team_odds={e.home_odds} away_team_odds={e.away_odds} home_score={e.home_score} away_score={e.away_score} odds_update_time={e.odds_timestamp} />
        ))} */}
      </div>
    </div>
  );
}


export default Home;
