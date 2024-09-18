import Standings from "@/components/Standings";
import { getAllEvents, getAllTeams } from "@/lib/dbFns";
import { getTeamRecord, rankTeams } from "../standingsUtils";


interface ConferenceProbs {
  team_id: string;
  win_conference_probability: number;
  name: string;
}

const ConferenceStandingsPage = async () => {


  const allEvents = await getAllEvents();
  const allTeams = await getAllTeams();

  const nfcTeams = allTeams.filter((team) => team.division.startsWith("NFC")).map((team) => team.id);
  const afcTeams = allTeams.filter((team) => team.division.startsWith("AFC")).map((team) => team.id);

  const teamRecordRows = getTeamRecord(allEvents, allTeams);

  const nfcTeamsRanked = rankTeams(nfcTeams, allEvents, teamRecordRows, 'conference').map((team) => teamRecordRows[team]);
  const afcTeamsRanked = rankTeams(afcTeams, allEvents, teamRecordRows, 'conference').map((team) => teamRecordRows[team]);



  return (
    <div className="flex flex-col gap-6 mt-8">
      <Standings title="NFC" orderedRecordRows={nfcTeamsRanked} />
      <Standings title="AFC" orderedRecordRows={afcTeamsRanked} />

    </div>
  )
}

export default ConferenceStandingsPage;