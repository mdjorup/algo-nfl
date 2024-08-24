import { promises as fs } from 'fs';


export default async function Home() {

  const file = await fs.readFile(process.cwd() + '/src/data/events.json', 'utf8');
  const data = JSON.parse(file);
  



  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <p>Title</p>
      <p>This is another thing</p>
      {JSON.stringify(data)}
      
      
    </main>
  );
}
