import { COLORS } from "@/lib/consts";
import { getWinProbability } from "@/lib/dbFns";
import { formatAsPercent } from "@/lib/format-utils";
import Image from "next/image";
import Link from "next/link";
import DateRender from "./DateRender";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

interface GameComponentProps {
  event_id: string;
  home_team: string;
  away_team: string;
  commence_time: Date;
  home_team_odds: number;
  away_team_odds: number;
  home_score?: number;
  away_score?: number;
  complete: boolean;
  odds_update_time?: Date;
}

export const TeamRow = ({ team_name, win_probability, isHomeTeam }: { team_name: string, win_probability: number, isHomeTeam: boolean }) => {

  const display_name = team_name.split(" ").pop() || team_name

  const team_color = COLORS[team_name]

  const display_probability = formatAsPercent(win_probability)
  return (
    <div className="flex justify-between items-center w-full" >
      <Image src={`/${team_name}.png`} alt={team_name} width={35} height={35} />
      <div className="flex w-full items-center justify-between pl-4">
        <div className="text-sm sm:text-lg font-bold">{display_name}</div>
        <Badge variant={win_probability > .5 ? "default" : win_probability < 0.5 ? "destructive" : "outline"} className="text-xs">{display_probability}</Badge>
      </div>
    </div>
  )
}

const Game = ({ event_id, home_team, away_team, commence_time, home_team_odds, away_team_odds, home_score, away_score, complete, odds_update_time }: GameComponentProps) => {

  const { homeWinProbability, awayWinProbability } = getWinProbability(home_team_odds, away_team_odds)



  return (
    <Card className="relative overflow-hidden p-4 sm:p-5">
      <Link href={`/games/${event_id}`}>

        <div>
          <DateRender date={commence_time} dateFormat="EEE @ p" /></div>

        <div className="w-full mt-2 flex flex-col gap-1 sm:gap-2">
          <TeamRow team_name={away_team} win_probability={awayWinProbability} isHomeTeam={false} />
          <TeamRow team_name={home_team} win_probability={homeWinProbability} isHomeTeam={true} />
        </div>
        {odds_update_time && <div className="flex w-full justify-end items-center text-muted-foreground italic text-xs mt-1">
          <p>Updated{` `}
            <DateRender date={odds_update_time} dateFormat="LL/cc p" /></p>
        </div>}
      </Link>
    </Card>
  )
}

export default Game