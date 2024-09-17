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
  data: { [key: string]: number };
  color: string;
}

const getChartData = (rawChartData: { [key: string]: number }) => {
  // find probability of each win total
  const data = []
  for (let i = 0; i <= 17; i++) {
    const dataKey = i.toString();
    data.push({
      wins: i,
      probability: rawChartData[i] ?? 0
    })
  }
  return data
}

const WinDistributionChart: React.FC<WinDistributionChartProps> = ({ data, color }) => {

  const chartData = getChartData(data);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Win Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChart width={600} height={300} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="wins"
            label={{ value: 'Number of Wins', position: 'bottom' }}
            max={17}
            min={0}
          />
          <YAxis
            tickFormatter={(value: number) => formatAsPercent(value)}
          />
          <Tooltip
            formatter={(value: number) => formatAsPercent(value, 0)}
            labelFormatter={(label: number) => `Wins: ${label}`}
          />
          <Bar dataKey="probability" className={`fill-${color}`} />
        </BarChart>
      </CardContent>
    </Card>
  )
}

export default WinDistributionChart;
