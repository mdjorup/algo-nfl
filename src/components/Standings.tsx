import { formatAsPercent } from "@/lib/format-utils";
import { TeamRecordRow } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

interface StandingsProps {
  title: string;
  orderedRecordRows: TeamRecordRow[];
}

const Standings = ({ title, orderedRecordRows }: StandingsProps) => {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600">
        <CardTitle className="text-2xl font-bold text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 dark:bg-gray-800">
              <TableHead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">Team</TableHead>
              <TableHead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">W</TableHead>
              <TableHead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">L</TableHead>
              <TableHead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">T</TableHead>
              <TableHead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">PCT</TableHead>
              <TableHead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">PF</TableHead>
              <TableHead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">PA</TableHead>
              <TableHead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">Net</TableHead>
              <TableHead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">Div</TableHead>
              <TableHead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">PCT</TableHead>
              <TableHead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">Conf</TableHead>
              <TableHead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">PCT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderedRecordRows.map((teamRecord, i) => {
              const totalGames = teamRecord.wins + teamRecord.losses + teamRecord.ties;
              const gameWinPoints = teamRecord.wins + (teamRecord.ties / 2);
              const totalDivisionGames = teamRecord.divisionWins + teamRecord.divisionLosses + teamRecord.divisionTies;
              const divisionWinPoints = teamRecord.divisionWins + (teamRecord.divisionTies / 2);
              const totalConferenceGames = teamRecord.conferenceWins + teamRecord.conferenceLosses + teamRecord.conferenceTies;
              const conferenceWinPoints = teamRecord.conferenceWins + (teamRecord.conferenceTies / 2);

              return (
                <TableRow key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <TableCell className="font-medium">
                    <Link className="flex items-center space-x-3" href={`/teams/${teamRecord.teamName.toLowerCase().split(" ").join("-")}`}>
                      <div className="relative w-8 h-8">
                        <Image
                          src={`/${teamRecord.teamName}.png`}
                          alt={`${teamRecord.teamName} Logo`}
                          width={32}
                          height={32}
                        />
                      </div>
                      <span className="hidden md:block">{teamRecord.teamName.split(" ").pop()}</span>
                    </Link>
                  </TableCell>
                  <TableCell>{teamRecord.wins}</TableCell>
                  <TableCell>{teamRecord.losses}</TableCell>
                  <TableCell>{teamRecord.ties}</TableCell>
                  <TableCell>{totalGames === 0 ? formatAsPercent(0) : formatAsPercent(gameWinPoints / totalGames, 0)}</TableCell>
                  <TableCell>{teamRecord.pointsFor}</TableCell>
                  <TableCell>{teamRecord.pointsAgainst}</TableCell>
                  <TableCell className={teamRecord.pointsFor - teamRecord.pointsAgainst > 0 ? "text-green-600" : "text-red-600"}>
                    {teamRecord.pointsFor - teamRecord.pointsAgainst}
                  </TableCell>
                  <TableCell>{`${teamRecord.divisionWins}-${teamRecord.divisionLosses}-${teamRecord.divisionTies}`}</TableCell>
                  <TableCell>{totalDivisionGames === 0 ? formatAsPercent(0, 0) : formatAsPercent(divisionWinPoints / totalDivisionGames, 0)}</TableCell>
                  <TableCell>{`${teamRecord.conferenceWins}-${teamRecord.conferenceLosses}-${teamRecord.conferenceTies}`}</TableCell>
                  <TableCell>{totalConferenceGames === 0 ? formatAsPercent(0, 0) : formatAsPercent(conferenceWinPoints / totalConferenceGames, 0)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Standings;