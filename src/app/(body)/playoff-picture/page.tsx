
import { DataTable } from '@/components/ui/data-table';
import { query } from '@/lib/db';
import { columns, SeasonSimulationRow } from './columns';


const getSeasonSimulations = async (): Promise<SeasonSimulationRow[]> => {

  const results = await query<{
    make_playoffs_probability: number;
    win_division_probability: number;
    win_conference_probability: number;
    expected_wins: number;
    name: string;
    id: string;
    division: string;
    wins: number;
    losses: number;
    ties: number;
    make_playoffs_probability_change: number;
    win_division_probability_change: number;
    win_conference_probability_change: number;

  }>(`
    WITH current_simulation AS (
      SELECT *
      FROM public.nfl_season_simulation
      WHERE created_at = (SELECT MAX(created_at) FROM public.nfl_season_simulation)
    ),
    previous_simulation AS (
      SELECT *
      FROM public.nfl_season_simulation
      WHERE created_at = (
        SELECT MAX(created_at)
        FROM public.nfl_season_simulation
        WHERE created_at <= (SELECT MAX(created_at) - INTERVAL '1 week' FROM public.nfl_season_simulation)
      )
    )
    SELECT 
      cs.make_playoffs_probability,
      cs.win_division_probability,
      cs.win_conference_probability,
      cs.expected_wins,
      t.name,
      t.id,
      t.division,
      t.wins,
      t.losses,
      t.ties,
      cs.make_playoffs_probability - COALESCE(ps.make_playoffs_probability, 0) AS make_playoffs_probability_change,
      cs.win_division_probability - COALESCE(ps.win_division_probability, 0) AS win_division_probability_change,
      cs.win_conference_probability - COALESCE(ps.win_conference_probability, 0) AS win_conference_probability_change
    FROM 
      current_simulation cs
    JOIN 
      public.teams t ON cs.team_id = t.id
    LEFT JOIN
      previous_simulation ps ON cs.team_id = ps.team_id
    ORDER BY 
      cs.id;
    `, []);


  return results.map(row => ({
    ...row,
    make_playoffs_probability_change: Number(row.make_playoffs_probability_change),
    win_division_probability_change: Number(row.win_division_probability_change),
    win_conference_probability_change: Number(row.win_conference_probability_change)
  }));;
}


const PlayoffPicturePage = async () => {

  const data = await getSeasonSimulations();

  data.sort((a, b) => b.make_playoffs_probability - a.make_playoffs_probability)

  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-3xl font-bold mb-8'>
        2024 NFL Post Season Probabilities
      </h1>
      <p className='mb-4'>
        The following table shows the playoff probabilities for each NFL team based on 100,000 simulations of the remaining games in the season. All games are simulated using the current odds of every game.
      </p>
      <p className='mb-4'>
        All changes are relative to their probabilities about 1 week ago.
      </p>
      <DataTable columns={columns} data={data} />
    </div>
  )
}

export default PlayoffPicturePage