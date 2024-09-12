import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const TeamSchedule = () => {
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


      </TableBody>

    </Table>
  )
}

export default TeamSchedule