
'use client';

import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { ChartDataItem } from '@/lib/types';

interface DifficultyChartProps {
  data: ChartDataItem[];
}

const chartConfig = {
  count: {
    label: 'Questions',
  },
  Easy: { label: 'Easy', color: 'hsl(var(--chart-1))' },
  Medium: { label: 'Medium', color: 'hsl(var(--chart-2))' },
  Hard: { label: 'Hard', color: 'hsl(var(--chart-3))' },
} satisfies Record<string, any>;


export function DifficultyChart({ data }: DifficultyChartProps) {
  if (!data || data.reduce((sum, item) => sum + item.count, 0) === 0) {
    return (
      <div className="h-[300px] w-full bg-muted/50 rounded-md flex items-center justify-center">
        <p className="text-muted-foreground">No difficulty data available to display chart.</p>
      </div>
    );
  }
  // Map data to include specific keys for Recharts if needed, or use dataKey directly
  const chartData = data.map(item => ({ name: item.name, count: item.count, fill: item.fill }));


  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ right: 20, left: 10 }}>
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis type="number" dataKey="count" />
          <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} stroke="#888888" fontSize={12} width={60} />
          <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent hideLabel />} />
          <Legend content={<ChartLegendContent />} />
          <Bar dataKey="count" radius={4}>
            {chartData.map((entry, index) => (
              <div key={`cell-${index}`} style={{backgroundColor: entry.fill}} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
