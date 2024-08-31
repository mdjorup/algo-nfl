import Standings from "@/components/Standings";
import { SEASON } from "@/lib/consts";
import { query } from "@/lib/db";
import { Team } from "@/lib/types";


interface DivisionProbs {
  team_id: string;
  win_division_probability: number;
  name: string;
}

const DivisionStandingsPage = async () => {


  // get latest division win probabilities 

  const divisionProbsPromise = query<DivisionProbs>(`
    SELECT 
        nss.team_id,
        nss.win_division_probability,
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


  const [divisionProbs, teams] = await Promise.all([divisionProbsPromise, teamsPromise])
  const divisionWinProbMap = new Map<string, number>()

  divisionProbs.forEach((dp) => {
    divisionWinProbMap.set(dp.team_id, dp.win_division_probability)
  })


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
      <Standings title="NFC East" teams={teams.filter((team) => team.division === 'NFC East')} probabilityMap={divisionWinProbMap} />
      <Standings title="NFC North" teams={teams.filter((team) => team.division === 'NFC North')} probabilityMap={divisionWinProbMap} />
      <Standings title="NFC South" teams={teams.filter((team) => team.division === 'NFC South')} probabilityMap={divisionWinProbMap} />
      <Standings title="NFC West" teams={teams.filter((team) => team.division === 'NFC West')} probabilityMap={divisionWinProbMap} />
      <Standings title="AFC East" teams={teams.filter((team) => team.division === 'AFC East')} probabilityMap={divisionWinProbMap} />
      <Standings title="AFC North" teams={teams.filter((team) => team.division === 'AFC North')} probabilityMap={divisionWinProbMap} />
      <Standings title="AFC South" teams={teams.filter((team) => team.division === 'AFC South')} probabilityMap={divisionWinProbMap} />
      <Standings title="AFC West" teams={teams.filter((team) => team.division === 'AFC West')} probabilityMap={divisionWinProbMap} />


    </div>
  )
}

export default DivisionStandingsPage