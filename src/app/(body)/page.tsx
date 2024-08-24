import { getEvents, getOdds } from '@/lib/utils';


export default async function Home() {


  const events = await getEvents();
  const odds = await getOdds()

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <p>Title</p>
      <p>This is another thing</p>
      <div>

        {JSON.stringify(odds)}
      </div>


    </main>
  );
}
