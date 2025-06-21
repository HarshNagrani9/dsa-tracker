'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { ChartDataItem } from '@/lib/types';

interface TopicChartProps {
  data: ChartDataItem[];
}

export function TopicChart({ data }: TopicChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] w-full bg-muted/50 rounded-md flex items-center justify-center">
        <p className="text-muted-foreground">No topic data available to display chart.</p>
      </div>
    );
  }

  const chartConfig = data.reduce((acc, item) => {
    acc[item.name] = { label: item.name, color: item.fill };
    return acc;
    }, {} as Record<string, { label: string; color: string }>);

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ right: 20, left: 10 }}>
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis type="number" dataKey="count" />
          <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} stroke="#888888" fontSize={12} width={80} />
          <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent hideLabel />} />
          <Bar dataKey="count" radius={4}>
            {data.map((entry) => (
              <div key={entry.name} style={{backgroundColor: entry.fill}} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
} 