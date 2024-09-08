import Game from '@/components/game';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { getAllEventsWithNames, getAllLatestEventOdds, getCurrentWeekRange, getStartAndEndOfWeek } from '@/lib/dbFns';

const GamePage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) => {

  let queriedWeek = searchParams.week ? parseInt(searchParams.week as string) : 0
  let start;
  let end;

  if (queriedWeek <= 0) {
    const weekRange = getCurrentWeekRange();
    queriedWeek = weekRange.week
    start = weekRange.start
    end = weekRange.end
  } else {
    const weekRange = getStartAndEndOfWeek(queriedWeek);
    start = weekRange.start
    end = weekRange.end
  }

  const events = await getAllEventsWithNames();
  const odds = await getAllLatestEventOdds();

  const currentWeekEvents = events.filter((event) => {
    return event.commence_time >= start && event.commence_time < end
  })

  const relevantOdds = odds.filter((odd) => {
    return currentWeekEvents.find((event) => {
      return event.id === odd.event_id
    })
  })

  const paginationPreviousLink = `/games?week=${Math.max(queriedWeek - 1, 1)}`
  const paginationNextLink = `/games?week=${Math.min(queriedWeek + 1, 18)}`


  const getOddsForEvent = (eventId: string) => {
    return relevantOdds.find((odd) => odd.event_id === eventId)
  }





  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {`Week ${queriedWeek} Games`}
      </h1>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious isActive={queriedWeek !== 1} href={paginationPreviousLink} />
          </PaginationItem>
          {Array.from(Array(18).keys()).map((i) => {
            const week = i + 1
            const link = `/games?week=${week}`
            return (
              <PaginationItem key={i}>
                <PaginationLink href={link} isActive={week === queriedWeek}>
                  {week}
                </PaginationLink>
              </PaginationItem>
            )
          })}
          <PaginationItem>
            <PaginationNext href={paginationNextLink} isActive={queriedWeek !== 18} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {
          currentWeekEvents.sort((e1, e2) => e1.commence_time.getTime() - e2.commence_time.getTime()).map((event, i) => {
            const gameOdds = getOddsForEvent(event.id)
            return <Game key={i} id={event.id} commence_time={event.commence_time} away_name={event.away_name} home_name={event.home_name} away_score={event.away_score} home_score={event.home_score} odds_timestamp={gameOdds?.latest_timestamp} home_team_odds={gameOdds?.home_odds_ema ?? 2} away_team_odds={gameOdds?.away_odds_ema ?? 2} completed={event.completed} />
          })
        }
      </div>
    </div>
  )
}

export default GamePage