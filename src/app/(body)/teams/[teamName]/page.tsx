


// We want: Expected Wins 
// How expected wins have changed over time 
// Playoff odds 
// Division odds
// Conference odds
// Schedule and results 

import { getTeamSeasonSimulations } from "@/lib/dbFns";
import RadialChart from "./RadialChart";



const formatTeamName = (team: string) => team.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

const Page = async (
  { params }: {
    params: { teamName: string }
  }) => {

  const teamName = formatTeamName(params.teamName ?? '');

  if (!teamName) {
    return (
      <div>
        <p>Team not found</p>
      </div>
    )
  }

  const seasonSimulations = await getTeamSeasonSimulations(teamName).then(simulations => simulations.sort((a, b) => a.created_at.getTime() - b.created_at.getTime()));


  const latestSimulation = seasonSimulations[seasonSimulations.length - 1];
  const previousSimulation = seasonSimulations[seasonSimulations.length - 2];


  const latestExpectedWins = latestSimulation.expected_wins;
  const previousExpectedWins = previousSimulation.expected_wins;



  return (

    <div >
      <p className="text-3xl">{teamName}</p>

      <div className="w-1/2 grid grid-cols-1 xl:grid-cols-2 gap-4">

        {latestExpectedWins && <RadialChart
          label="Expected Wins"
          teamName={teamName}
          fillColor={params.teamName}
          fillPercent={1}
          centerText={latestExpectedWins.toFixed(1)}
          change={previousExpectedWins ? (latestExpectedWins - previousExpectedWins) : undefined}
        />}
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

export default Page