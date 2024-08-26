import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        <div className="flex flex-wrap gap-2">
          {schedule.map(({ id, commence_time, home_team, away_team }) => {
            const isHome = home_team === team;
            const opponent = isHome ? away_team : home_team;
            const winProb = calculateWinProb(team, odds[id]);
            return (
              <div key={id} className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
                <span className="text-xs font-semibold">{format(new Date(commence_time), 'MM/dd')}</span>
                <Image src={`/${opponent}.png`} alt={opponent} width={20} height={20} />
                <span className="text-xs">{isHome ? 'vs' : '@'}</span>
                <Badge
                  variant={winProb > 0.5 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {(winProb * 100).toFixed(0)}%
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamScheduleProbs;