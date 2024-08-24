import TeamScheduleProbs from '@/components/TeamScheduleProbs';
import { TEAMS } from '@/lib/consts';
import { getEvents, getOdds } from '@/lib/utils';


export default async function Home() {


  const events = await getEvents();
  const odds = await getOdds()

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">NFL Team Schedules</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEAMS.map((team) => {
          const teamSchedule = events.filter(
            (event) => event.home_team === team || event.away_team === team
          );

          return (
            <TeamScheduleProbs
              team={team}
              key={team}
              schedule={teamSchedule}
              odds={odds}
            />
          );
        })}
      </div>
    </main>
  );
}
