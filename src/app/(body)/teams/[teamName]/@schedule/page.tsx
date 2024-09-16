import DateRender from "@/components/DateRender";
import ProbabilityBadge from "@/components/ProbabilityBadge";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllEventsWithNames, getAllLatestEventOdds, getWinProbability } from "@/lib/dbFns";
import Image from 'next/image';

const formatTeamName = (team: string) => team.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');


const TeamSchedule = async ({ params }: {
  params: { teamName: string }
}) => {


  const teamName = formatTeamName(params.teamName ?? '');


  const eventsWithNames = await getAllEventsWithNames().then((events) => events.filter((e) => e.home_name === teamName || e.away_name === teamName).sort((a, b) => a.commence_time.getTime() - b.commence_time.getTime()));

  const eventProbabilities = await getAllLatestEventOdds().then((odds) => odds.filter((o) => eventsWithNames.map((e) => e.id).includes(o.event_id)));


  return (
    <Table>
      <TableCaption>Schedule</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Week</TableHead>
          <TableHead>Opponent</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Result</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {eventsWithNames.map((event) => {
          const opponent = event.home_name === teamName ? event.away_name : event.home_name;

          const eventOdds = eventProbabilities.find((o) => o.event_id === event.id);

          const { homeWinProbability, awayWinProbability } = getWinProbability(eventOdds?.home_odds_avg ?? 1, eventOdds?.away_odds_avg ?? 1);

          const winProbability = event.home_name === teamName ? homeWinProbability : awayWinProbability;

          const winLossOrTie = event.home_name === teamName ? event.home_score > event.away_score ? 'W' : event.home_score < event.away_score ? 'L' : 'T' : event.away_score > event.home_score ? 'W' : event.away_score < event.home_score ? 'L' : 'T';

          const teamScore = event.home_name === teamName ? event.home_score : event.away_score;
          const opponentScore = event.home_name === teamName ? event.away_score : event.home_score;

          return (
            <TableRow key={event.id}>
              <TableCell>{1}</TableCell>
              <TableCell className="flex items-center gap-2"><Image src={`/${opponent}.png`} width={30} height={30} alt={opponent} /> <span>{opponent.split(" ").pop()}</span></TableCell>
              <TableCell><DateRender date={event.commence_time} dateFormat="MM/dd" /></TableCell>
              <TableCell className="text-right">
                {event.completed ? `${winLossOrTie} ${teamScore} - ${opponentScore}` : <ProbabilityBadge probability={winProbability} />}
              </TableCell>
            </TableRow>
          )
        })}


      </TableBody>

    </Table>
  )
}

export default TeamSchedule