
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { query } from '@/lib/db';
import { formatAsPercent } from '@/lib/format-utils';
import { SeasonSimulation } from '@/lib/types';



interface SeasonSimulationTableEntry extends SeasonSimulation {
  name: string;
}


const getSeasonSimulations = async (): Promise<SeasonSimulationTableEntry[]> => {

  console.log('Getting season simulations');
  const results = await query<SeasonSimulationTableEntry>(`
    SELECT 
        nss.*,
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
  // Start color (green): hsl(142.1, 76.2%, 36.3%)
  // End color (red): hsl(0, 84.2%, 60.2%)

  const startHue = 142.1;
  const endHue = 0;
  const startSaturation = 76.2;
  const endSaturation = 84.2;
  const startLightness = 36.3;
  const endLightness = 60.2;

  const hue = startHue + (endHue - startHue) * (1 - probability);
  const saturation = startSaturation + (endSaturation - startSaturation) * (1 - probability);
  const lightness = startLightness + (endLightness - startLightness) * (1 - probability);

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const ProbabilityBadge = ({ probability }: { probability: number }) => (
  <Badge
    style={{
      backgroundColor: getBackgroundColor(probability),
      color: 'white',
    }}
  >
    {formatAsPercent(probability)}
  </Badge>
);


const PlayoffPicturePage = async () => {

  const data = await getSeasonSimulations();

  const sorted = data.sort((a, b) => b.make_playoffs_probability - a.make_playoffs_probability)

  return (
    <div className='container mx-auto py-10'>
      <Table>
        <TableCaption>NFL Playoff Probabilities - 100,000 Simulations</TableCaption>
        <TableHeader>
          <TableRow className=''>
            <TableHead className="">Team</TableHead>
            <TableHead className="">Make Playoffs</TableHead>
            <TableHead className="">Win Division</TableHead>
            <TableHead className="">Win Conference</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((entry, index) => (
            <TableRow key={entry.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <TableCell className="font-medium">{entry.name}</TableCell>
              <TableCell>
                <ProbabilityBadge probability={entry.make_playoffs_probability} />
              </TableCell>
              <TableCell>
                <ProbabilityBadge probability={entry.win_division_probability} />
              </TableCell>
              <TableCell>
                <ProbabilityBadge probability={entry.win_conference_probability} />
              </TableCell>
            </TableRow>
          ))}


        </TableBody>

      </Table>
    </div>
  )
}

export default PlayoffPicturePage