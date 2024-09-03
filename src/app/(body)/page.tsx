import Game from "@/components/game";
import { getCurrentWeekEventsWithOdds_cached } from "@/lib/cacheFunctions";
import { getCurrentWeekRange } from "@/lib/utils";
import { isBefore } from "date-fns";

const revalidate = 60 * 5; // 5 minutes




export default async function Home() {

  const eventsWithOdds = await getCurrentWeekEventsWithOdds_cached();

  const { week } = getCurrentWeekRange()


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {`Week ${week} Games`}
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {eventsWithOdds.sort((e1, e2) => isBefore(e1.commence_time, e2.commence_time) ? -1 : 1).map((e, i) => (
          <Game key={i} event_id={e.id} home_team={e.home_name} away_team={e.away_name} commence_time={e.commence_time} complete={e.completed} home_team_odds={e.home_odds} away_team_odds={e.away_odds} home_score={e.home_score} away_score={e.away_score} odds_update_time={e.odds_timestamp} />
        ))}
      </div>
    </div>
  );
}
