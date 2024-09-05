'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAsPercent } from "@/lib/format-utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import Image from "next/image";


export type SeasonSimulationRow = {
  name: string;
  make_playoffs_probability: number;
  win_division_probability: number;
  win_conference_probability: number;
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

const ProbabilityBadge = ({ probability }: { probability: number }) => (
  <Badge
    style={{
      backgroundColor: getBackgroundColor(probability),
      color: 'white',
    }}
    className="ml-4"
  >
    {formatAsPercent(probability)}
  </Badge>
);

export const columns: ColumnDef<SeasonSimulationRow>[] = [
  {
    accessorKey: 'name',
    header: "Team",
    cell: ({ row }) => {
      return (
        <div className="flex gap-3 justify-start items-center font-bold">
          <Image src={`/${row.getValue<string>("name")}.png`} alt={row.getValue("name")} width={35} height={35} />
          <span className="hidden sm:block">
            {row.getValue<string>("name").split(" ").pop()}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'make_playoffs_probability',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Make Playoffs
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const val = parseFloat(row.getValue("make_playoffs_probability"));
      return <ProbabilityBadge probability={val} />
    }
  },
  {
    accessorKey: 'win_division_probability',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Win Division
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const val = parseFloat(row.getValue("win_division_probability"));
      return <ProbabilityBadge probability={val} />
    }
  },
  {
    accessorKey: 'win_conference_probability',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Win Conference
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const val = parseFloat(row.getValue("win_conference_probability"));
      return <ProbabilityBadge probability={val} />
    }
  },

]