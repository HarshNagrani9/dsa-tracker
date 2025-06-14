
'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { ChartDataItem } from '@/lib/types';

interface PlatformChartProps {
  data: ChartDataItem[];
}

// chartConfig can be generated dynamically based on data if platforms are not fixed
// For now, assume platforms in constants cover the main ones.
const chartConfig = {
  count: { label: 'Questions' },
  LeetCode: { label: 'LeetCode', color: 'hsl(var(--chart-1))' },
  CSES: { label: 'CSES', color: 'hsl(var(--chart-2))' },
  CodeChef: { label: 'CodeChef', color: 'hsl(var(--chart-3))' },
  Codeforces: { label: 'Codeforces', color: 'hsl(var(--chart-4))' },
  Other: { label: 'Other', color: 'hsl(var(--chart-5))' },
} satisfies Record<string, any>;


export function PlatformChart({ data }: PlatformChartProps) {
   if (!data || data.reduce((sum, item) => sum + item.count, 0) === 0) {
    return (
      <div className="h-[300px] w-full bg-muted/50 rounded-md flex items-center justify-center">
        <p className="text-muted-foreground">No platform data available to display chart.</p>
      </div>
    );
  }
  const chartData = data.filter(item => item.count > 0);


  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted))' }}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={60}
            paddingAngle={2}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
           <Legend content={<ChartLegendContent nameKey="name" className="mt-4 flex-wrap justify-center"/>} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
