import { getCurrentWeekEvents } from "@/lib/utils";


export default async function Home() {

  const events = await getCurrentWeekEvents();


  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8"></h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {JSON.stringify(events)}
      </div>
    </main>
  );
}
