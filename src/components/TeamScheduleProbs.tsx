
interface TeamScheduleProbsProps {
  team: string;
  schedule: Event[];
  odds: Record<string, EventOdds>;
}

const TeamScheduleProbs = ({ }: TeamScheduleProbsProps) => {
  return (
    <div>TeamScheduleProbs</div>
  )
}

export default TeamScheduleProbs