import Standings from "@/components/Standings";
import { getAllDivisionRankings } from "@/lib/rankings";


interface DivisionProbs {
  team_id: string;
  win_division_probability: number;
  name: string;
}

const DivisionStandingsPage = async () => {


  const rankings = await getAllDivisionRankings();



  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
      <Standings title="NFC East" orderedTeams={rankings["NFC East"]} />
      <Standings title="NFC North" orderedTeams={rankings["NFC North"]} />
      <Standings title="NFC South" orderedTeams={rankings["NFC South"]} />
      <Standings title="NFC West" orderedTeams={rankings["NFC West"]} />
      <Standings title="AFC East" orderedTeams={rankings["AFC East"]} />
      <Standings title="AFC North" orderedTeams={rankings["AFC North"]} />
      <Standings title="AFC South" orderedTeams={rankings["AFC South"]} />
      <Standings title="AFC West" orderedTeams={rankings["AFC West"]} />


    </div>
  )
}

export default DivisionStandingsPage