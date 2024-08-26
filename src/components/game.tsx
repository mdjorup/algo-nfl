import { format, isBefore } from "date-fns";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface GameComponentProps {
  event_id: string;
  home_team: string;
  away_team: string;
  commence_time: Date;
  home_team_win_prob: number;
  away_team_win_prob: number;
  home_score?: number;
  away_score?: number;
  complete: boolean;
}

const Game = ({ event_id, home_team, away_team, commence_time, home_team_win_prob, away_team_win_prob, home_score, away_score, complete }: GameComponentProps) => {

  const gameDescription = complete ? "Final" : isBefore(new Date(), commence_time) ? format(commence_time, "E..EEE @ p") : "Live"


  return (
    <Card>
      <CardHeader>
        <CardDescription>
          {gameDescription}
        </CardDescription>
        <CardTitle>


        </CardTitle>

      </CardHeader>

    </Card>
  )
}

export default Game