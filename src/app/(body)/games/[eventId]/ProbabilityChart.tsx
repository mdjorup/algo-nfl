"use client"

import { TrendingDown, TrendingUp } from "lucide-react"
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer
} from "@/components/ui/chart"
import { COLORS } from "@/lib/consts"
import { formatAsPercent } from "@/lib/format-utils"
import { format } from "date-fns"

export const description = "A multiple line chart"



const formatDate = (date: Date) => {
  return format(date, 'MMM d, h a');
};

const buildChartConfig = (homeTeam: string, awayTeam: string): ChartConfig => {
  return {
    homeOdds: {
      label: homeTeam,
      color: COLORS[homeTeam],
    },
    awayOdds: {
      label: awayTeam,
      color: COLORS[awayTeam],
    }
  }
}

export const getWinProbability = (homeOdds: number, awayOdds: number) => {
  const totalOdds = homeOdds + awayOdds;

  const implied_home_prob = 1 / homeOdds;
  const implied_away_prob = 1 / awayOdds;

  const total = implied_away_prob + implied_home_prob;

  const homeWinProbability = implied_home_prob / total;
  const awayWinProbability = implied_away_prob / total;

  return { homeWinProbability, awayWinProbability };
};

interface ProbabilityChartProps {
  homeTeam: string;
  awayTeam: string;
  data: EventOdds[];

}

const ProbabilityChart = ({ homeTeam, awayTeam, data }: ProbabilityChartProps) => {
  const chartConfig = buildChartConfig(homeTeam, awayTeam);

  const processedData = data.map((point) => {
    const { homeWinProbability, awayWinProbability } = getWinProbability(point.home_odds, point.away_odds);
    return {
      ...point,
      timestamp: new Date(point.timestamp),
      homeWinProbability: Math.round(homeWinProbability * 1000) / 10,
      awayWinProbability: Math.round(awayWinProbability * 1000) / 10,
    };
  });

  const latestHomeProb = processedData[processedData.length - 1].homeWinProbability;
  const earliestHomeProb = processedData[0].homeWinProbability;
  const probChange = latestHomeProb - earliestHomeProb;

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle>Win Probability</CardTitle>
        <CardDescription>
          Tracking win probabilities based on betting odds
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={processedData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatDate}
              label={{ value: 'Date', position: 'insideBottomRight', offset: -10 }}
              angle={-30}
              textAnchor="end"
              height={70}
            />
            <YAxis
              label={{ value: 'Win Probability (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value, name) => [`${value}%`, name]}
              labelFormatter={formatDate}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="homeWinProbability"
              name={homeTeam}
              stroke={COLORS[homeTeam]}
              strokeWidth={4}
              dot={false}


            />
            <Line
              type="monotone"
              dataKey="awayWinProbability"
              name={awayTeam}
              stroke={COLORS[awayTeam]}
              strokeWidth={4}
              dot={false}

            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {homeTeam}&#39;s win probability is {probChange > 0 ? "up" : "down"} by {formatAsPercent(Math.abs(probChange) / 100)}
              {probChange > 0 ? <TrendingUp className={`h-4 w-4 text-green-500`} /> : <TrendingDown className={`h-4 w-4 text-red-500`} />}
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Based on betting odds from {formatDate(processedData[0].timestamp)} to {formatDate(processedData[processedData.length - 1].timestamp)}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default ProbabilityChart;
