"use client"

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { formatAsPercent } from "@/lib/format-utils"

export const description = "A bar chart"

interface WinDistributionChartProps {
  data: { wins: number, probability: number }[];
  color: string;
}

const WinDistributionChart: React.FC<WinDistributionChartProps> = ({ data, color }) => {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Win Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChart width={600} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="wins"
            label={{ value: 'Number of Wins', position: 'bottom' }}
            max={17}
            min={0}
          />
          <YAxis
            label={{ value: 'Probability', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: number) => formatAsPercent(value)}
            labelFormatter={(label: number) => `Wins: ${label}`}
          />
          <Bar dataKey="probability" className={`fill-${color}`} />
        </BarChart>
      </CardContent>
    </Card>
  )
}

export default WinDistributionChart;
