'use client';

import React from "react";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

interface RadialChartProps {
  label: string;
  teamName: string;
  fillColor: string;
  fillPercent: number;
  centerText: string;
  change?: number;
}

export const RadialChart: React.FC<RadialChartProps> = ({ label, teamName, fillColor, fillPercent, centerText, change }) => {
  const chartConfig = {
    data: {
      label: label,
    },
  } satisfies ChartConfig

  const chartData = [
    { name: 'fill', value: fillPercent * 100 },
    { name: 'background', value: 100 },
  ]

  return (
    <Card className="flex flex-col">
      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-sm">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-3">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[180px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={-270}
            innerRadius={60}
            outerRadius={120}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
            />
            <RadialBar
              dataKey="value"
              background
              cornerRadius={8}
              data={[chartData[1]]}
              fill="#ffffff"
            />
            <RadialBar
              dataKey="value"
              background
              cornerRadius={8}
              data={[chartData[0]]}
              className={`fill-${fillColor}`}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {centerText}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      {change && <CardFooter className="p-3 pt-0 text-xs">
        <div className={cn("flex items-center gap-1 font-medium leading-none", change > 0 ? 'text-green-500' : 'text-destructive')}>
          {change > 0 ? "Up" : "Down"} {(change * 100).toFixed(1) + "%"} {change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        </div>
      </CardFooter>}
    </Card>
  )
}

export default RadialChart