import { getTeamSeasonSimulations } from "@/lib/dbFns";
import RadialChart from "./RadialChart";
import WinDistributionChart from "./WinDistributionChart";

const formatTeamName = (team: string) => team.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');


const normalDistribution = (x: number, mean: number, stdDev: number) => {
  const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI))
  const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2))
  return coefficient * Math.exp(exponent)
}

const getChartData = (averageWins: number, stdDev: number) => {
  // find probability of each win total
  const data = []
  for (let i = 0; i <= 17; i++) {
    data.push({
      wins: i,
      probability: normalDistribution(i, averageWins, stdDev),
    })
  }
  return data
}


const SimulationStats = async (
  { params }: {
    params: { teamName: string }
  }) => {

  const teamName = formatTeamName(params.teamName ?? '');

  const seasonSimulations = await getTeamSeasonSimulations(teamName).then(simulations => simulations.sort((a, b) => a.created_at.getTime() - b.created_at.getTime()));

  const latestSimulation = seasonSimulations[seasonSimulations.length - 1];
  const previousSimulation = seasonSimulations[seasonSimulations.length - 2];


  const latestExpectedWins = latestSimulation.expected_wins;
  const previousExpectedWins = previousSimulation.expected_wins;

  const distributionChartData = getChartData(latestExpectedWins ?? 8, latestSimulation.expected_wins_std ?? 1);

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
          change={latestSimulation.make_playoffs_probability - previousSimulation.make_playoffs_probability}
        />
        <RadialChart
          label="Win Division"
          teamName={teamName}
          fillColor={params.teamName}
          fillPercent={latestSimulation.win_division_probability}
          centerText={(latestSimulation.win_division_probability * 100).toFixed(1) + '%'}
          change={latestSimulation.win_division_probability - previousSimulation.win_division_probability}
        />
        <RadialChart
          label="Win Conference"
          teamName={teamName}
          fillColor={params.teamName}
          fillPercent={latestSimulation.win_conference_probability}
          centerText={(latestSimulation.win_conference_probability * 100).toFixed(1) + '%'}
          change={latestSimulation.win_conference_probability - previousSimulation.win_conference_probability}
        />
      </div>
    </div>
  )
}

export default SimulationStats