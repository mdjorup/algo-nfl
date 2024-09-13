import DateRender from "@/components/DateRender";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllEventsWithNames } from "@/lib/dbFns";
import Image from 'next/image';

const formatTeamName = (team: string) => team.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');


const TeamSchedule = async ({ params }: {
  params: { teamName: string }
}) => {


  const teamName = formatTeamName(params.teamName ?? '');


  const eventsWithNames = await getAllEventsWithNames().then((events) => events.filter((e) => e.home_name === teamName || e.away_name === teamName).sort((a, b) => a.commence_time.getTime() - b.commence_time.getTime()));



  return (
    <Table>
      <TableCaption>Schedule</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Week</TableHead>
          <TableHead>Opponent</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Result</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {eventsWithNames.map((event) => {
          const opponent = event.home_name === teamName ? event.away_name : event.home_name;
          return (
            <TableRow key={event.id}>
              <TableCell>{1}</TableCell>
              <TableCell className="flex items-center gap-2"><Image src={`/${opponent}.png`} width={30} height={30} alt={opponent} /> <span>{opponent.split(" ").pop()}</span></TableCell>
              <TableCell><DateRender date={event.commence_time} dateFormat="MM/dd" /></TableCell>
              <TableCell></TableCell>
            </TableRow>
          )
        })}


      </TableBody>

    </Table>
  )
}

export default TeamSchedule