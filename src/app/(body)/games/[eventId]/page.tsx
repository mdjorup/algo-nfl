import { getEvent_cached, getEventOdds_cached } from '@/lib/cacheFunctions';
import { EventOdds } from '@/lib/types';
import ProbabilityChart from './ProbabilityChart';


const averageOddsDataPoints = (eventOdds: EventOdds[], timeWindowMs: number = 60000): EventOdds[] => {

  const sortedDataPoints = eventOdds.map((odds) => {
    return {
      ...odds,
      timestamp: new Date(odds.timestamp),
    }
  }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  if (sortedDataPoints.length === 0) {
    return [];
  }
  const result: EventOdds[] = [];
  let currentWindow: EventOdds[] = [];
  let windowStartTime = sortedDataPoints[0].timestamp.getTime();

  for (const dataPoint of sortedDataPoints) {
    const currentTime = dataPoint.timestamp.getTime();

    if (currentTime - windowStartTime > timeWindowMs) {
      if (currentWindow.length > 0) {
        const averagedPoint = averageWindow(currentWindow);
        result.push(averagedPoint);
      }
      currentWindow = [];
      windowStartTime = currentTime;
    }

    currentWindow.push(dataPoint);
  }

  // Handle the last window
  if (currentWindow.length > 0) {
    const averagedPoint = averageWindow(currentWindow);
    result.push(averagedPoint);
  }

  return result;



}

const averageWindow = (window: EventOdds[]): EventOdds => {
  const count = window.length;
  const sum = window.reduce((acc, point) => ({
    home_odds: acc.home_odds + point.home_odds,
    away_odds: acc.away_odds + point.away_odds,
  }), { home_odds: 0, away_odds: 0 });

  return {
    id: window[window.length - 1].id,
    event_id: window[0].event_id,
    timestamp: new Date((window[0].timestamp.getTime() + window[window.length - 1].timestamp.getTime()) / 2),
    home_odds: sum.home_odds / count,
    away_odds: sum.away_odds / count,
  };
};

const GamePage = async ({ params }: { params: { eventId: string } }) => {


  const [event, eventOdds] = await Promise.all([getEvent_cached(params.eventId), getEventOdds_cached(params.eventId)]);

  // console.log(eventOdds)
  const averagedOdds = averageOddsDataPoints(eventOdds);

  return (
    <div className='w-1/2 h-1/2'>
      <ProbabilityChart homeTeam={event.home_name} awayTeam={event.away_name} data={averagedOdds} />
    </div>
  )
}

export default GamePage