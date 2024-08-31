import Standings from "@/components/Standings";
import { SEASON } from "@/lib/consts";
import { query } from "@/lib/db";
import { Team } from "@/lib/types";


interface ConferenceProbs {
  team_id: string;
  win_conference_probability: number;
  name: string;
}

const ConferenceStandingsPage = async () => {


  // get latest division win probabilities 

  const divisionProbsPromise = query<ConferenceProbs>(`
    SELECT 
        nss.team_id,
        nss.win_conference_probability,
        t.name
    FROM 
        public.nfl_season_simulation nss
    JOIN 
        public.teams t ON nss.team_id = t.id
    WHERE 
        nss.simulation_group = (
            SELECT MAX(simulation_group) 
            FROM public.nfl_season_simulation
        )
    ORDER BY 
        t.name;`, [])

  const teamsPromise = query<Team>(`
    select * from teams
where season = '${SEASON}'
    `)


  const [conferenceProbs, teams] = await Promise.all([divisionProbsPromise, teamsPromise])
  const conferenceWinProbMap = new Map<string, number>()

  conferenceProbs.forEach((cp) => {
    conferenceWinProbMap.set(cp.team_id, cp.win_conference_probability)
  })


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
      <Standings title="NFC" teams={teams.filter((team) => team.division.startsWith("NFC"))} probabilityMap={conferenceWinProbMap} />
      <Standings title="AFC" teams={teams.filter((team) => team.division.startsWith("AFC"))} probabilityMap={conferenceWinProbMap} />

    </div>
  )
}

export default ConferenceStandingsPage;