import { COLORS } from "@/lib/consts";
import { getWinProbability } from "@/lib/dbFns";
import { formatAsPercent } from "@/lib/format-utils";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import DateRender from "./DateRender";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

interface GameComponentProps {
  id: string;
  commence_time: Date;
  away_name: string;
  home_name: string;
  home_team_odds: number;
  away_team_odds: number;
  home_score?: number;
  away_score?: number;
  completed?: boolean;
  odds_timestamp?: Date;
}

const TeamRow = ({ team_name, win_probability, isHomeTeam, score, isWinner, showProbability }: { team_name: string, win_probability: number, isHomeTeam: boolean, score?: number, isWinner: boolean, showProbability: boolean }) => {
  const display_name = team_name.split(" ").pop() || team_name;
  const team_color = COLORS[team_name];
  const display_probability = formatAsPercent(win_probability);

  return (
    <div className={cn("flex justify-between items-center w-full p-2 rounded", isWinner ? 'bg-green-100' : '')} style={{ borderLeft: `4px solid ${team_color}` }}>
      <Image src={`/${team_name}.png`} alt={team_name} width={35} height={35} />
      <div className="flex w-full items-center justify-between pl-4">
        <div className="text-sm sm:text-lg font-bold">{display_name}</div>
        <div className="flex items-center gap-2">
          {score !== undefined && (
            <span className="text-sm font-semibold">{score}</span>
          )}
          {showProbability && (
            <Badge variant={win_probability > .5 ? "default" : win_probability < 0.5 ? "destructive" : "outline"} className="text-xs">{display_probability}</Badge>
          )}
        </div>
      </div>
    </div>
  );
};

const Game = (props: GameComponentProps) => {
  const { homeWinProbability, awayWinProbability } = getWinProbability(props.home_team_odds, props.away_team_odds);
  const isInProgress = !props.completed && new Date() > props.commence_time;
  const showProbability = !props.completed;

  return (
    <Card className="relative overflow-hidden p-4 sm:p-5 hover:shadow-lg transition-shadow duration-300">
      <Link href={`/games/${props.id}`}>
        <div className="flex justify-between items-center mb-3">
          <DateRender date={props.commence_time} dateFormat="EEE @ p" />
          {props.completed ? (
            <Badge variant="secondary">Final</Badge>
          ) : isInProgress ? (
            <Badge variant="default" className="bg-yellow-500">In Progress</Badge>
          ) : (
            <Badge variant="outline">Upcoming</Badge>
          )}
        </div>

        <div className="w-full mt-2 flex flex-col gap-2">
          <TeamRow
            team_name={props.away_name}
            win_probability={awayWinProbability}
            isHomeTeam={false}
            score={props.away_score}
            isWinner={(props.completed || false) && (props.away_score ?? 0) > (props.home_score ?? 0)}
            showProbability={showProbability}
          />
          <TeamRow
            team_name={props.home_name}
            win_probability={homeWinProbability}
            isHomeTeam={true}
            score={props.home_score}
            isWinner={(props.completed || false) && (props.away_score ?? 0) < (props.home_score ?? 0)}
            showProbability={showProbability}
          />
        </div>
        {props.odds_timestamp && showProbability && (
          <div className="flex w-full justify-end items-center text-muted-foreground italic text-xs mt-3">
            <p>Odds updated <DateRender date={props.odds_timestamp} dateFormat="MM/dd p" /></p>
          </div>
        )}
      </Link>
    </Card>
  );
};

export default Game