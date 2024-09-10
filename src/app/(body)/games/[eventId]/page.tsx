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
      <div className="flex flex-col md:flex-row justify-between items-center">
        <TeamInfo
          name={event.away_name}
          score={event.away_score}
          winProbability={winProbabilities?.awayWinProbability}
          color={awayColor}
          isAway={true}
          isActive={isGameActive}
        />
        <GameStatus
          centerTimeString={centerTimeString}
          awayScore={event.away_score}
          homeScore={event.home_score}
          isCompleted={event.completed}
          isActive={isGameActive}
        />
        <TeamInfo
          name={event.home_name}
          score={event.home_score}
          winProbability={winProbabilities?.homeWinProbability}
          color={homeColor}
          isAway={false}
          isActive={isGameActive}
        />
      </div>
      <ProbabilityChart homeTeam={event.home_name} awayTeam={event.away_name} data={chartOdds} />
      {!event.completed && <SportsbookOddsTable awayTeam={event.away_name} homeTeam={event.home_name} data={latestSportsbookOdds} />}
    </div>
  )
}

interface TeamInfoProps {
  name: string;
  score: number | null;
  winProbability: number | undefined;
  color: string;
  isAway: boolean;
  isActive: boolean;
};

interface GameStatusProps {
  centerTimeString: string;
  awayScore: number | null;
  homeScore: number | null;
  isCompleted: boolean;
  isActive: boolean;
};

const TeamInfo: React.FC<TeamInfoProps> = ({ name, score, winProbability, color, isAway, isActive }) => (
  <div className={`flex items-center space-x-4 py-4 px-6 my-2 w-full md:w-auto relative overflow-hidden rounded-lg ${isAway ? 'md:flex-row' : 'md:flex-row-reverse'}`}
    style={{
      background: `linear-gradient(${isAway ? '135deg' : '225deg'}, ${color}aa 0%, transparent 70%)`,
    }}>
    <Image src={`/${name}.png`} alt={name} width={64} height={64} />
    <div className={`text-${isAway ? 'left' : 'right'}`}>
      <h2 className="text-xl md:text-2xl font-bold">{name}</h2>
      {isActive && winProbability && (
        <p className="text-sm text-gray-600">{formatAsPercent(winProbability)} win probability</p>
      )}
    </div>
  </div>
);

const GameStatus: React.FC<GameStatusProps> = ({ centerTimeString, awayScore, homeScore, isCompleted, isActive }) => (
  <div className="text-center my-4 md:my-0">
    <p className="text-lg font-semibold mb-2">
      {centerTimeString}
    </p>
    {isCompleted || isActive ? (
      <p className="text-3xl font-bold">{awayScore ?? 0} - {homeScore ?? 0}</p>
    ) : (
      <p className="text-xl">VS</p>
    )}
  </div>
);

export default GamePage