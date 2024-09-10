import { Team } from "@/lib/types"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"

interface StandingsProps {
  title: string;
  orderedTeams: Team[];
}

const Standings = ({ title, orderedTeams }: StandingsProps) => {

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead>Win</TableHead>
              <TableHead>Loss</TableHead>
              <TableHead>Tie</TableHead>
            </TableRow>

          </TableHeader>
          <TableBody>
            {orderedTeams.map((team, i) => (
              <TableRow key={team.id}>
                <TableCell className="flex gap-4 font-bold items-center">
                  <Image src={`/${team.name}.png`} alt={`${team.name} Logo`} height={35} width={35} />
                  <span className="hidden md:block">
                    {team.name.split(" ").pop()}
                  </span>
                </TableCell>
                <TableCell>{team.wins}</TableCell>
                <TableCell>{team.losses}</TableCell>
                <TableCell>{team.ties}</TableCell>
              </TableRow>

            ))}

          </TableBody>


        </Table>
      </CardContent>

    </Card>
  )

}

export default Standings;