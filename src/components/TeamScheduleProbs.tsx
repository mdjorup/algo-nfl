import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calculateWinProb } from '@/lib/utils';
import { format } from 'date-fns';
import Image from "next/image";
import React from 'react';
import { Badge } from "./ui/badge";

interface TeamScheduleProbsProps extends React.HTMLAttributes<HTMLDivElement> {
  team: string;
  schedule: ODDSAPI_Event[];
  odds: Record<string, EventOdds>;
}

const week1StartDate = new Date("2024-09-04");

const TeamScheduleProbs = ({ team, schedule, odds }: TeamScheduleProbsProps) => {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Image src={`/${team}.png`} alt={team} width={24} height={24} />

          <span>{team}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Matchup</TableHead>
              <TableHead>Win Probability</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedule.map((event) => {
              const winProb = calculateWinProb(team, odds[event.id]);
              const eventDate = new Date(event.commence_time);
              const isHome = event.home_team === team;
              const opponent = isHome ? event.away_team : event.home_team;

              const opponentMascot = opponent.split(" ").pop();

              return (
                <TableRow key={event.id}>
                  <TableCell>{format(eventDate, 'MM/dd')}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Image src={`/${opponent}.png`} alt={opponent} width={24} height={24} />
                      <span>{isHome ? 'vs' : '@'} {opponentMascot}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={winProb > 0.5 ? "default" : "destructive"}>
                      {(winProb * 100).toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TeamScheduleProbs;