"use client";

import * as React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { useAuth } from '@/providers/AuthProvider';
import { getHeatmapDataAction } from '@/lib/actions/questionActions';
import type { HeatmapData } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { subYears, startOfDay, endOfDay } from 'date-fns';

export function Heatmap() {
  const { user } = useAuth();
  const [data, setData] = React.useState<HeatmapData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchHeatmapData() {
      if (user?.uid) {
        setIsLoading(true);
        const heatmapData = await getHeatmapDataAction(user.uid);
        setData(heatmapData);
        setIsLoading(false);
      }
    }
    fetchHeatmapData();
  }, [user]);

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/3 mb-2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-40 w-full" />
            </CardContent>
        </Card>
    );
  }

  const today = new Date();
  const startDate = startOfDay(subYears(today, 1));
  const endDate = endOfDay(today);

  return (
    <Card>
        <CardHeader>
            <CardTitle>Activity Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
            <CalendarHeatmap
                startDate={startDate}
                endDate={endDate}
                values={data}
                classForValue={(value) => {
                    if (!value) {
                        return 'color-empty';
                    }
                    // The count can be higher than 4, so cap it at 4
                    const count = Math.min(value.count, 4);
                    return `color-red-${count}`;
                }}
                titleForValue={value => {
                    if (!value || !value.date) {
                        return 'No activity';
                    }
                    return `${value.count} questions on ${value.date}`;
                }}
            />
        </CardContent>
    </Card>
  );
} 