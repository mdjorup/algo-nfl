import Standings from "@/components/Standings";
import { getConferenceRankings } from "@/lib/rankings";


interface ConferenceProbs {
  team_id: string;
  win_conference_probability: number;
  name: string;
}

const ConferenceStandingsPage = async () => {


  // get latest division win probabilities 

  const { nfcRankings, afcRankings } = await getConferenceRankings();



  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
      <Standings title="NFC" orderedTeams={nfcRankings} />
      <Standings title="AFC" orderedTeams={afcRankings} />

    </div>
  )
}

export default ConferenceStandingsPage;