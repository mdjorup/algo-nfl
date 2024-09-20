'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAsPercent } from "@/lib/format-utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Award, ChevronDown, ChevronUp, Medal, Trophy } from "lucide-react";
import Image from "next/image";

export type SeasonSimulationRow = {
  name: string;
  wins: number;
  losses: number;
  ties: number;
  division: string;
  expected_wins: number;
  make_playoffs_probability: number;
  make_playoffs_probability_change: number;
  win_division_probability: number;
  win_division_probability_change: number;
  win_conference_probability: number;
  win_conference_probability_change: number;
}
const getBackgroundColor = (probability: number) => {
  const lightBlue = [240, 50, 95]; // HSL values
  const darkBlue = [220, 80, 40];  // HSL values

  const interpolate = (start: number, end: number, t: number) => {
    return start + (end - start) * t;
  };

  const h = interpolate(lightBlue[0], darkBlue[0], probability);
  const s = interpolate(lightBlue[1], darkBlue[1], probability);
  const l = interpolate(lightBlue[2], darkBlue[2], probability);

  return `hsl(${h}, ${s}%, ${l}%)`;
};

const ProbabilityCell = ({ probability, change }: { probability: number; change: number }) => (
  <div className="flex flex-col items-center">
    <Badge
      style={{
        backgroundColor: getBackgroundColor(probability),
        color: probability > 0.5 ? 'white' : 'black',
      }}
      className="text-sm font-bold mb-1"
    >
      {formatAsPercent(probability, 1)}
    </Badge>
    <div className={`flex items-center text-xs font-semibold ${change > 0 ? 'text-green-600 dark:text-green-400' :
      change < 0 ? 'text-red-600 dark:text-red-400' :
        'text-gray-600 dark:text-gray-400'
      }`}>
      {change > 0 ? <ChevronUp size={12} /> :
        change < 0 ? <ChevronDown size={12} /> :
          null}
      <span>{formatAsPercent(change, 1)}</span>
    </div>
  </div>
);

export const columns: ColumnDef<SeasonSimulationRow>[] = [
  {
    accessorKey: 'name',
    header: "Team",
    cell: ({ row }) => {
      const recordString = `${row.original.wins}-${row.original.losses}-${row.original.ties}`;
      return (
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center items-center lg:gap-3">
          <Image src={`/${row.getValue<string>("name")}.png`} alt={row.getValue("name")} width={35} height={35} />
          <span className="hidden sm:block text-lg font-bold text-gray-800 dark:text-gray-200">
            {row.getValue<string>("name").split(" ").pop()}
          </span>
          <span className="hidden sm:block text-muted-foreground text-xs">
            {recordString}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'division',
    header: "Division",
    cell: ({ row }) => {
      return <span className="text-sm">{row.getValue("division")}</span>
    }
  },
  {
    accessorKey: 'expected_wins',
    header: "Proj. Record",
    cell: ({ row }) => {
      const expected_wins = Math.round(row.getValue("expected_wins"));
      const expected_losses = 17 - expected_wins;
      const recordString = `${expected_wins}-${expected_losses}`;
      return <span className="text-md font-bold pl-2">{recordString}</span>
    }
  },
  {
    accessorKey: 'make_playoffs_probability',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200"
      >
        <Trophy className="mr-2 h-4 w-4 text-blue-500" />
        Make Playoffs
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <ProbabilityCell
        probability={row.getValue("make_playoffs_probability")}
        change={row.original.make_playoffs_probability_change}
      />
    )
  },
  {
    accessorKey: 'win_division_probability',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="hover:bg-green-100 dark:hover:bg-green-900 transition-colors duration-200"
      >
        <Medal className="mr-2 h-4 w-4 text-green-500" />
        Win Division
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <ProbabilityCell
        probability={row.getValue("win_division_probability")}
        change={row.original.win_division_probability_change}
      />
    )
  },
  {
    accessorKey: 'win_conference_probability',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors duration-200"
      >
        <Award className="mr-2 h-4 w-4 text-purple-500" />
        Win Conference
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <ProbabilityCell
        probability={row.getValue("win_conference_probability")}
        change={row.original.win_conference_probability_change}
      />
    )
  },
];