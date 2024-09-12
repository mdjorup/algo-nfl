
import { DataTable } from '@/components/ui/data-table';
import { query } from '@/lib/db';
import { columns, SeasonSimulationRow } from './columns';


const getSeasonSimulations = async (): Promise<SeasonSimulationRow[]> => {

  const results = await query<SeasonSimulationRow>(`
    SELECT 
        nss.make_playoffs_probability,
        nss.win_division_probability,
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
        nss.id;
    `, []);



  return results;
}

const getBackgroundColor = (probability: number) => {
  // Red: hsl(0, 84.2%, 60.2%)
  // Light Grey: hsl(0, 0%, 75%)
  // Green: hsl(142.1, 76.2%, 36.3%)

  const redHue = 0;
  const redSaturation = 84.2;
  const redLightness = 60.2;

  const greyHue = 0;
  const greySaturation = 0;
  const greyLightness = 75;

  const greenHue = 142.1;
  const greenSaturation = 76.2;
  const greenLightness = 36.3;

  // Sigmoid function for non-linear interpolation
  const sigmoid = (x: number): number => {
    return 1 / (1 + Math.exp(-12 * (x - 0.5)));
  };

  // Apply sigmoid function to probability
  const t = sigmoid(probability);

  let hue, saturation, lightness;

  if (probability <= 0.5) {
    // Interpolate between red and light grey
    hue = redHue;
    saturation = redSaturation + (greySaturation - redSaturation) * t * 2;
    lightness = redLightness + (greyLightness - redLightness) * t * 2;
  } else {
    // Interpolate between light grey and green
    hue = greyHue + (greenHue - greyHue) * (t - 0.5) * 2;
    saturation = greySaturation + (greenSaturation - greySaturation) * (t - 0.5) * 2;
    lightness = greyLightness + (greenLightness - greyLightness) * (t - 0.5) * 2;
  }

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};


const PlayoffPicturePage = async () => {

  const data = await getSeasonSimulations();

  data.sort((a, b) => b.make_playoffs_probability - a.make_playoffs_probability)

  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-3xl font-bold mb-8'>
        2024 NFL Post Season Probabilities
      </h1>
      <p className='mb-8'>
        The following table shows the playoff probabilities for each NFL team based on 100,000 simulations of the remaining games in the season. All games are simulated using the current odds of every game. The probabilities are based on the number of times each team made the playoffs, won their division, and won the conference in the simulations.
      </p>
      <DataTable columns={columns} data={data} />
    </div>
  )
}

export default PlayoffPicturePage