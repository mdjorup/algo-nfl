import SportsbookOddsTable from '@/components/SportsbookOddsTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getEvent_cached, getEventOdds_cached } from '@/lib/cacheFunctions';
import { EventOdds } from '@/lib/types';
import { format } from 'date-fns';
import { ArrowLeftRight, Calendar, Clock } from 'lucide-react';
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

  const latestSportsbookOdds = Array.from(new Map(eventOddsData.filter((odds) => odds.sportsbook_key != null).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()).map(entry => [entry.sportsbook_key, entry])).values()).sort((a, b) => a.home_odds - b.home_odds);


  // 

  return (
    <div className="container mx-auto px-4 py-8 mb-20">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <Image src={`/${event.away_name}.png`} alt={event.away_name} width={60} height={60} />
            <span className="ml-4">{event.away_name}</span>
            <span className="mx-4"> @ </span>
            <span className="mr-4">{event.home_name}</span>
            <Image src={`/${event.home_name}.png`} alt={event.home_name} width={60} height={60} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <Calendar className="mr-2" />
              <span>{format(new Date(event.commence_time), 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2" />
              <span>{format(new Date(event.commence_time), 'h:mm a')}</span>
            </div>
            <div className="flex items-center">
              <ArrowLeftRight className="mr-2" />
              <span>{event.completed ? 'Completed' : 'Upcoming'}</span>
            </div>
          </div>
          {event.completed && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Final Score</h3>
              <div className="flex justify-center items-center space-x-4">
                <span className="text-xl">{event.home_name}: {event.home_score}</span>
                <span className="text-xl">-</span>
                <span className="text-xl">{event.away_name}: {event.away_score}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="odds" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="odds">Odds</TabsTrigger>
          <TabsTrigger value="chart">Probability Chart</TabsTrigger>
        </TabsList>
        <TabsContent value="odds">
          <Card>
            <CardHeader>
              <CardTitle>Latest Sportsbook Odds</CardTitle>
            </CardHeader>
            <CardContent>
              <SportsbookOddsTable awayTeam={event.away_name} homeTeam={event.home_name} data={latestSportsbookOdds} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="chart">
          <ProbabilityChart homeTeam={event.home_name} awayTeam={event.away_name} data={averagedOdds} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default GamePage