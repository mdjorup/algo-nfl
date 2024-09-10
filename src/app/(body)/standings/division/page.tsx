import Standings from "@/components/Standings";
import { getRankings } from "@/lib/rankings";


interface DivisionProbs {
  team_id: string;
  win_division_probability: number;
  name: string;
}

const DivisionStandingsPage = async () => {


  const rankings = await getRankings();


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
      <Standings title="NFC East" orderedTeams={rankings.filter((team) => team.division === 'NFC East')} />
      <Standings title="NFC North" orderedTeams={rankings.filter((team) => team.division === 'NFC North')} />
      <Standings title="NFC South" orderedTeams={rankings.filter((team) => team.division === 'NFC South')} />
      <Standings title="NFC West" orderedTeams={rankings.filter((team) => team.division === 'NFC West')} />
      <Standings title="AFC East" orderedTeams={rankings.filter((team) => team.division === 'AFC East')} />
      <Standings title="AFC North" orderedTeams={rankings.filter((team) => team.division === 'AFC North')} />
      <Standings title="AFC South" orderedTeams={rankings.filter((team) => team.division === 'AFC South')} />
      <Standings title="AFC West" orderedTeams={rankings.filter((team) => team.division === 'AFC West')} />


    </div>
  )
}

export default DivisionStandingsPage