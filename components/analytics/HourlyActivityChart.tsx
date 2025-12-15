'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Loader2, Clock } from 'lucide-react';

interface HourlyActivity {
  hour: number;
  events: number;
}

interface HourlyActivityChartProps {
  data: HourlyActivity[];
  isLoading?: boolean;
}

export function HourlyActivityChart({ data, isLoading = false }: HourlyActivityChartProps) {
  const [mounted, setMounted] = useState(false);
  const [RechartsComponents, setRechartsComponents] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    import('recharts').then((mod) => {
      setRechartsComponents(mod);
    });
  }, []);

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

  if (isLoading || !mounted || !RechartsComponents) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Peak Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } = RechartsComponents;

  const chartData = data.map((item) => ({
    hour: formatHour(item.hour),
    events: item.events,
    rawHour: item.hour,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900">{data.hour}</p>
          <p className="text-sm text-slate-600">
            Events: <span className="font-semibold">{data.events.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Find peak hour
  const peakHour = data.reduce((max, item) => item.events > max.events ? item : max, data[0] || { hour: 0, events: 0 });

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Peak Hours</CardTitle>
          {peakHour && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              Peak: {formatHour(peakHour.hour)}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
            No activity data available
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  interval={2}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={(value: number) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString()}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="events"
                  fill="#334155"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
