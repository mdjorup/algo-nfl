import { formatAsPercent } from "@/lib/format-utils"
import { Team } from "@/lib/types"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"

interface StandingsProps {
  title: string;
  teams: Team[];
  probabilityMap: Map<string, number> // team id to probability
  n_highlighted?: number;

}

const Standings = ({ title, teams, probabilityMap, n_highlighted }: StandingsProps) => {

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
              <TableHead>Win Probability</TableHead>
            </TableRow>

          </TableHeader>
          <TableBody>
            {teams.sort((t1, t2) => {
              if (t2.wins !== t1.wins) {
                return t2.wins - t1.wins
              }

              const t1WinProb = probabilityMap.get(t1.id) ?? 0;
              const t2WinProb = probabilityMap.get(t2.id) ?? 0;
              if (t1WinProb !== t2WinProb) {
                return t2WinProb - t1WinProb;
              }

              return 0;
            }).map((team, i) => (
              <TableRow key={team.id} className={`${i < (n_highlighted ?? 0) ? "bg-blue-300" : ""}`}>
                <TableCell className="flex gap-4 font-bold items-center">
                  <Image src={`/${team.name}.png`} alt={`${team.name} Logo`} height={35} width={35} />{team.name.split(" ").pop()}</TableCell>
                <TableCell>{team.wins}</TableCell>
                <TableCell>{team.losses}</TableCell>
                <TableCell>{team.ties}</TableCell>
                <TableCell>{probabilityMap.get(team.id) ? formatAsPercent(probabilityMap.get(team.id) ?? 0) : 'N/A'}</TableCell>
              </TableRow>

            ))}

          </TableBody>


        </Table>
      </CardContent>

    </Card>
  )

}

export default Standings;