import { getTeamSeasonSimulations } from "@/lib/dbFns";
import { subDays } from "date-fns";
import RadialChart from "./RadialChart";
import WinDistributionChart from "./WinDistributionChart";

const formatTeamName = (team: string) => team.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');


const SimulationStats = async (
  { params }: {
    params: { teamName: string }
  }) => {

  const teamName = formatTeamName(params.teamName ?? '');

  const seasonSimulations = await getTeamSeasonSimulations(teamName).then(simulations => simulations.sort((a, b) => a.created_at.getTime() - b.created_at.getTime()));

  const latestSimulation = seasonSimulations[seasonSimulations.length - 1];

  const weekAgoSimulation = seasonSimulations.filter(sim => {
    const weekAgo = subDays(new Date(), 7);
    const simDate = new Date(sim.created_at);
    return simDate.getTime() < weekAgo.getTime();
  }).sort((a, b) => b.created_at.getTime() - a.created_at.getTime());


  const previousSimulation = weekAgoSimulation.length > 0 ? weekAgoSimulation[weekAgoSimulation.length - 1] : undefined;

  const distributionChartData = latestSimulation.win_total_probabilities ?? {}

  return (
    <div>


      <WinDistributionChart data={distributionChartData} color={params.teamName} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
        <RadialChart
          label="Make Playoffs"
          teamName={teamName}
          fillColor={params.teamName}
          fillPercent={latestSimulation.make_playoffs_probability}
          centerText={(latestSimulation.make_playoffs_probability * 100).toFixed(1) + '%'}
          change={previousSimulation ? latestSimulation.make_playoffs_probability - previousSimulation.make_playoffs_probability : 0}
        />
        <RadialChart
          label="Win Division"
          teamName={teamName}
          fillColor={params.teamName}
          fillPercent={latestSimulation.win_division_probability}
          centerText={(latestSimulation.win_division_probability * 100).toFixed(1) + '%'}
          change={previousSimulation ? latestSimulation.win_division_probability - previousSimulation.win_division_probability : 0}
        />
        <RadialChart
          label="Win Conference"
          teamName={teamName}
          fillColor={params.teamName}
          fillPercent={latestSimulation.win_conference_probability}
          centerText={(latestSimulation.win_conference_probability * 100).toFixed(1) + '%'}
          change={previousSimulation ? latestSimulation.win_conference_probability - previousSimulation.win_conference_probability : 0}
        />
      </div>
    </div>
  )
}

export default SimulationStats