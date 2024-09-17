"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatAsPercent } from "@/lib/format-utils"
import React, { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export const description = "A responsive bar chart with improved x-axis label visibility"

interface WinDistributionChartProps {
  data: { [key: string]: number };
  color: string;
}

const getChartData = (rawChartData: { [key: string]: number }) => {
  const data = []
  for (let i = 0; i <= 17; i++) {
    data.push({
      wins: i,
      probability: rawChartData[i] ?? 0
    })
  }
  return data
}

const WinDistributionChart: React.FC<WinDistributionChartProps> = ({ data, color }) => {
  const [chartHeight, setChartHeight] = useState(300)

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth
      setChartHeight(width < 400 ? 240 : 300)
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  const chartData = getChartData(data);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Win Distribution</CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="wins"
              label={{ value: 'Number of Wins', position: 'bottom', offset: 20 }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(value: number) => formatAsPercent(value)}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number) => formatAsPercent(value, 0)}
              labelFormatter={(label: number) => `Wins: ${label}`}
            />
            <Bar dataKey="probability" className={`fill-${color}`} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default WinDistributionChart;