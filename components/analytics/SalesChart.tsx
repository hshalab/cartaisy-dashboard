'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SalesChartProps {
  data: Array<{
    name: string;
    sales: number;
    orders: number;
  }>;
  isLoading?: boolean;
}

export function SalesChart({ data, isLoading = false }: SalesChartProps) {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [mounted, setMounted] = useState(false);
  const [RechartsComponents, setRechartsComponents] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    import('recharts').then((mod) => {
      setRechartsComponents(mod);
    });
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900">{label}</p>
          <p className="text-sm text-slate-600">
            Sales: <span className="font-semibold">${payload[0]?.value?.toLocaleString()}</span>
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
          <CardTitle className="text-base font-semibold">Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
  } = RechartsComponents;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Sales Overview</CardTitle>
        <div className="flex gap-1">
          <Button
            variant={chartType === 'area' ? 'default' : 'ghost'}
            size="sm"
            className={chartType === 'area' ? 'bg-slate-900 hover:bg-slate-800 h-8' : 'h-8'}
            onClick={() => setChartType('area')}
          >
            Area
          </Button>
          <Button
            variant={chartType === 'bar' ? 'default' : 'ghost'}
            size="sm"
            className={chartType === 'bar' ? 'bg-slate-900 hover:bg-slate-800 h-8' : 'h-8'}
            onClick={() => setChartType('bar')}
          >
            Bar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              No sales data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#334155" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#334155" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(value: number) => `$${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#334155"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                </AreaChart>
              ) : (
                <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(value: number) => `$${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="sales" fill="#334155" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
