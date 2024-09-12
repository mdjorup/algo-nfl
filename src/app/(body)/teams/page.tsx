import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllTeams } from '@/lib/dbFns';
import { getColorKey } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface TeamCardProps {
  name: string;
  wins: number;
  losses: number;
  ties: number;
}

const TeamCard: React.FC<TeamCardProps> = ({ name, wins, losses, ties }) => {

  const colorKey = getColorKey(name)

  return (
    <Card className={`flex items-center pl-4 bg-gradient-to-tl from-${colorKey} to-transparent to-50% hover:shadow-md cursor-pointer`}>
      {/* Logo on the left */}
      <div className="flex-shrink-0">
        <Image src={`/${name}.png`} width={50} height={50} alt={name} />
      </div>
      {/* Card header stuff on the right */}
      <div className="ml-4">
        <CardHeader>
          <CardTitle>{name}</CardTitle>
          <CardDescription>
            {wins}-{losses}-{ties}
          </CardDescription>
        </CardHeader>
      </div>
    </Card>
  );
};

const page = async () => {
  const allTeams = await getAllTeams();

  allTeams.sort((a, b) => (a.name < b.name ? -1 : 1));

  return (
    <div>
      <p className='text-2xl font-bold mb-8'>All Teams</p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {allTeams.map((team) => (
          <Link key={team.id} href={`/teams/${getColorKey(team.name)}`}>
            <TeamCard
              name={team.name}
              wins={team.wins}
              losses={team.losses}
              ties={team.ties}
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default page;
