import Standings from "@/components/Standings";
import { getAllEvents, getAllTeams } from "@/lib/dbFns";
import { getTeamRecord, rankTeams } from "../standingsUtils";





const DivisionStandingsPage = async () => {


  const allEvents = await getAllEvents();
  const allTeams = await getAllTeams();

  const nfcEastTeams = allTeams.filter((team) => team.division === "NFC East").map((team) => team.id);
  // const nfcNorthTeams = allTeams.filter((team) => team.division === "NFC North").map((team) => team.id);
  // const nfcSouthTeams = allTeams.filter((team) => team.division === "NFC South").map((team) => team.id);
  // const nfcWestTeams = allTeams.filter((team) => team.division === "NFC West").map((team) => team.id);
  // const afcEastTeams = allTeams.filter((team) => team.division === "AFC East").map((team) => team.id);
  // const afcNorthTeams = allTeams.filter((team) => team.division === "AFC North").map((team) => team.id);
  // const afcSouthTeams = allTeams.filter((team) => team.division === "AFC South").map((team) => team.id);
  const afcWestTeams = allTeams.filter((team) => team.division === "AFC West").map((team) => team.id);


  const teamRecordRows = getTeamRecord(allEvents, allTeams);


  const nfcEastTeamsRanked = rankTeams(nfcEastTeams, allEvents, teamRecordRows, 'division').map((team) => teamRecordRows[team]);
  // const nfcNorthTeamsRanked = rankTeams(nfcNorthTeams, allEvents, teamRecordRows, 'division').map((team) => teamRecordRows[team]);
  // const nfcSouthTeamsRanked = rankTeams(nfcSouthTeams, allEvents, teamRecordRows, 'division').map((team) => teamRecordRows[team]);
  // const nfcWestTeamsRanked = rankTeams(nfcWestTeams, allEvents, teamRecordRows, 'division').map((team) => teamRecordRows[team]);
  // const afcEastTeamsRanked = rankTeams(afcEastTeams, allEvents, teamRecordRows, 'division').map((team) => teamRecordRows[team]);
  // const afcNorthTeamsRanked = rankTeams(afcNorthTeams, allEvents, teamRecordRows, 'division').map((team) => teamRecordRows[team]);
  // const afcSouthTeamsRanked = rankTeams(afcSouthTeams, allEvents, teamRecordRows, 'division').map((team) => teamRecordRows[team]);
  const afcWestTeamsRanked = rankTeams(afcWestTeams, allEvents, teamRecordRows, 'division').map((team) => teamRecordRows[team]);


  return (
    <div className="flex flex-col gap-6 mt-8">
      <Standings title="NFC East" orderedRecordRows={nfcEastTeamsRanked} />
      {/* <Standings title="NFC North" orderedRecordRows={nfcNorthTeamsRanked} />
      <Standings title="NFC South" orderedRecordRows={nfcSouthTeamsRanked} />
      <Standings title="NFC West" orderedRecordRows={nfcWestTeamsRanked} />
      <Standings title="AFC East" orderedRecordRows={afcEastTeamsRanked} />
      <Standings title="AFC North" orderedRecordRows={afcNorthTeamsRanked} />
      <Standings title="AFC South" orderedRecordRows={afcSouthTeamsRanked} /> */}
      <Standings title="AFC West" orderedRecordRows={afcWestTeamsRanked} />

    </div>
  )
}

export default DivisionStandingsPage