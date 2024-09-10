import SportsbookOddsTable from '@/components/SportsbookOddsTable';
import { COLORS } from '@/lib/consts';
import { getEvent, getEventOdds, getWinProbability } from '@/lib/dbFns';
import { formatAsPercent } from '@/lib/format-utils';
import { EventOdds } from '@/lib/types';
import { addSeconds, format, subDays } from 'date-fns';
import Image from 'next/image';
import ProbabilityChart from './ProbabilityChart';


const averageOddsDataPoints = (
  eventOdds: EventOdds[],
  period: number,
  startTime: Date,
  endTime?: Date
): EventOdds[] => {
  const filteredOdds = eventOdds
    .filter(odds => !endTime || (odds.timestamp >= startTime && odds.timestamp <= endTime))
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const retOdds: EventOdds[] = [];
  let currentWindow: EventOdds[] = [];
  let currentStart = startTime;
  let currentEnd = addSeconds(currentStart, period);

  for (const odds of filteredOdds) {
    if (odds.timestamp <= currentEnd) {
      currentWindow.push(odds);
    } else {
      if (currentWindow.length > 0) {
        retOdds.push(averageWindow(currentWindow));
      }
      while (odds.timestamp > currentEnd) {
        currentStart = currentEnd;
        currentEnd = addSeconds(currentEnd, period);
      }
      currentWindow = [odds];
    }
  }

  if (currentWindow.length > 0) {
    retOdds.push(averageWindow(currentWindow));
  }

  return retOdds;
};

const averageWindow = (window: EventOdds[]): EventOdds => {
  const count = window.length;
  const sum = window.reduce(
    (acc, point) => ({
      home_odds: acc.home_odds + point.home_odds,
      away_odds: acc.away_odds + point.away_odds,
    }),
    { home_odds: 0, away_odds: 0 }
  );

  return {
    id: window[count - 1].id,
    event_id: window[0].event_id,
    timestamp: window[count - 1].timestamp,
    home_odds: sum.home_odds / count,
    away_odds: sum.away_odds / count,
  };
};

const GamePage = async ({ params }: { params: { eventId: string } }) => {


  const [event, eventOdds] = await Promise.all([getEvent(params.eventId), getEventOdds(params.eventId)]);

  const eventOddsData = eventOdds.map((odds) => {
    return {
      ...odds,
      timestamp: new Date(odds.timestamp),
    }
  }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());


  const commenceTime = new Date(event.commence_time);

  const latestSportsbookOdds = eventOddsData.slice(Math.max(eventOddsData.length - 10, 0)).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());


  const isGameActive = new Date(event.commence_time) <= new Date() && !event.completed;

  const oddsStartTime = (isGameActive || event.completed) ? commenceTime : subDays(commenceTime, 7);


  const chartOdds = averageOddsDataPoints(eventOddsData, 300, oddsStartTime, undefined);

  if (event.completed) {
    if (event.home_score > event.away_score) {
      chartOdds[chartOdds.length - 1].home_odds = 1;
      chartOdds[chartOdds.length - 1].away_odds = 10000;
    } else {
      chartOdds[chartOdds.length - 1].home_odds = 10000;
      chartOdds[chartOdds.length - 1].away_odds = 1;
    }
  }

  const currentOdds = latestSportsbookOdds[latestSportsbookOdds.length - 1]

  const formatGameTime = (date: Date | string) => {
    return format(new Date(date), 'MMM d, h:mm a');
  };



  const winProbabilities = currentOdds ? getWinProbability(currentOdds.home_odds, currentOdds.away_odds) : null;

  const homeColor = COLORS[event.home_name]; // #123abc
  const awayColor = COLORS[event.away_name]; // #abc123

  const centerTimeString = event.completed ? 'Final Score' : new Date() < event.commence_time ? formatGameTime(event.commence_time) : 'In Progress';
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
              <p className="text-sm text-gray-600">{formatAsPercent(winProbabilities.awayWinProbability)} win probability</p>
            )}
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">
            {centerTimeString}
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
              <p className="text-sm text-gray-600">{formatAsPercent(winProbabilities.homeWinProbability)} win probability</p>
            )}
          </div>
          <Image src={`/${event.home_name}.png`} alt={event.home_name} width={64} height={64} />
        </div>
      </div>
      <ProbabilityChart homeTeam={event.home_name} awayTeam={event.away_name} data={chartOdds} />
      {!event.completed && <SportsbookOddsTable awayTeam={event.away_name} homeTeam={event.home_name} data={latestSportsbookOdds} />}
    </div>
  )
}

export default GamePage