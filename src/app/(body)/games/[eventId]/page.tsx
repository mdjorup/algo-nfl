import SportsbookOddsTable from '@/components/SportsbookOddsTable';
import { getEvent_cached, getEventOdds_cached } from '@/lib/cacheFunctions';
import { COLORS } from '@/lib/consts';
import { EventOdds } from '@/lib/types';
import { format } from 'date-fns';
import Image from 'next/image';
import ProbabilityChart from './ProbabilityChart';


const averageOddsDataPoints = (eventOdds: EventOdds[], timeWindowMs: number = 60000): EventOdds[] => {

  const sortedDataPoints = eventOdds.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

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

  const eventOddsData = eventOdds.map((odds) => {
    return {
      ...odds,
      timestamp: new Date(odds.timestamp),
    }
  });

  // console.log(eventOdds)
  const averagedOdds = averageOddsDataPoints(eventOddsData);

  const latestSportsbookOdds = eventOddsData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);


  const isGameActive = new Date(event.commence_time) <= new Date() && !event.completed;

  const currentOdds = latestSportsbookOdds[latestSportsbookOdds.length - 1]

  const formatGameTime = (date: Date | string) => {
    return format(new Date(date), 'MMM d, h:mm a');
  };

  const calculateWinProbability = (odds: EventOdds) => {
    const totalOdds = odds.home_odds + odds.away_odds;
    return {
      home: ((1 / odds.home_odds) / totalOdds * 100).toFixed(1),
      away: ((1 / odds.away_odds) / totalOdds * 100).toFixed(1)
    };
  };

  const winProbabilities = currentOdds ? calculateWinProbability(currentOdds) : null;

  const homeColor = COLORS[event.home_name]; // #123abc
  const awayColor = COLORS[event.away_name]; // #abc123
  // 

  return (
    <div className="container flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4 py-8 relative overflow-hidden rounded-lg" style={{
          background: `linear-gradient(135deg, ${awayColor}aa 0%, transparent 70%)`,
          padding: '20px',
        }}>
          <Image src={`/${event.away_name}.png`} alt={event.away_name} width={64} height={64} />
          <div>
            <h2 className="text-2xl font-bold">{event.away_name}</h2>
            {isGameActive && winProbabilities && (
              <p className="text-sm text-gray-600">{winProbabilities.away}% win probability</p>
            )}
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">
            {event.completed ? 'Final Score' : formatGameTime(event.commence_time)}
          </p>
          {event.completed ? (
            <p className="text-3xl font-bold">{event.away_score} - {event.home_score}</p>
          ) : isGameActive ? (
            <p className="text-3xl font-bold">{event.away_score ?? 0} - {event.home_score ?? 0}</p>
          ) : (
            <p className="text-xl">VS</p>
          )}
        </div>
        <div className="flex items-center space-x-4 py-8 relative overflow-hidden rounded-lg" style={{
          background: `linear-gradient(225deg, ${homeColor}aa 0%, transparent 70%)`,
          padding: '20px',
        }}>
          <div className="text-right">
            <h2 className="text-2xl font-bold">{event.home_name}</h2>
            {isGameActive && winProbabilities && (
              <p className="text-sm text-gray-600">{winProbabilities.home}% win probability</p>
            )}
          </div>
          <Image src={`/${event.home_name}.png`} alt={event.home_name} width={64} height={64} />
        </div>
      </div>
      {!event.completed && <SportsbookOddsTable awayTeam={event.away_name} homeTeam={event.home_name} data={latestSportsbookOdds} />}
      <ProbabilityChart homeTeam={event.home_name} awayTeam={event.away_name} data={averagedOdds} />
    </div>
  )
}

export default GamePage