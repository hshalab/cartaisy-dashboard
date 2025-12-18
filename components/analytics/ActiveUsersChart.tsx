'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users } from 'lucide-react';

interface ActiveUsersChartProps {
  data: Array<{
    date: string;
    users: number;
  }>;
  isLoading?: boolean;
}

export function ActiveUsersChart({ data, isLoading = false }: ActiveUsersChartProps) {
  const [chartType, setChartType] = useState<'area' | 'line'>('area');
  const [mounted, setMounted] = useState(false);
  const [RechartsComponents, setRechartsComponents] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    import('recharts').then((mod) => {
      setRechartsComponents(mod);
    });
  }, []);

  // Format date for display
  const formattedData = data.map(item => ({
    ...item,
    name: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900">{label}</p>
          <p className="text-sm text-slate-600">
            Active Users: <span className="font-semibold text-blue-600">{payload[0]?.value?.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading || !mounted || !RechartsComponents) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-600" />
            <CardTitle className="text-base font-semibold">Daily Active Users</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    AreaChart,
    Area,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
  } = RechartsComponents;

  // Calculate min/max for Y axis
  const maxUsers = Math.max(...data.map(d => d.users), 1);
  const yAxisMax = Math.ceil(maxUsers * 1.1); // Add 10% padding

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-600" />
          <CardTitle className="text-base font-semibold">Daily Active Users</CardTitle>
        </div>
        <div className="flex gap-1">
          <Button
            variant={chartType === 'area' ? 'default' : 'ghost'}
            size="sm"
            className={chartType === 'area' ? 'bg-blue-600 hover:bg-blue-700 h-8' : 'h-8'}
            onClick={() => setChartType('area')}
          >
            Area
          </Button>
          <Button
            variant={chartType === 'line' ? 'default' : 'ghost'}
            size="sm"
            className={chartType === 'line' ? 'bg-blue-600 hover:bg-blue-700 h-8' : 'h-8'}
            onClick={() => setChartType('line')}
          >
            Line
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {formattedData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <Users className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-sm font-medium">No user activity data yet</p>
              <p className="text-xs text-slate-400 mt-1">Data will appear as users engage with your app</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, yAxisMax]}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    tickFormatter={(value: number) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString()}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                  />
                </AreaChart>
              ) : (
                <LineChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, yAxisMax]}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    tickFormatter={(value: number) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString()}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
