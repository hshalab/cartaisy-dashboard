'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Loader2, Smartphone, Monitor, Globe } from 'lucide-react';

interface PlatformData {
  platform: 'ios' | 'android' | 'web';
  count: number;
  percentage: number;
}

interface PlatformChartProps {
  data: PlatformData[];
  isLoading?: boolean;
}

const platformConfig = {
  ios: { label: 'iOS', color: '#334155', icon: Smartphone },
  android: { label: 'Android', color: '#64748b', icon: Smartphone },
  web: { label: 'Web', color: '#94a3b8', icon: Globe },
};

export function PlatformChart({ data, isLoading = false }: PlatformChartProps) {
  const [mounted, setMounted] = useState(false);
  const [RechartsComponents, setRechartsComponents] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    import('recharts').then((mod) => {
      setRechartsComponents(mod);
    });
  }, []);

  if (isLoading || !mounted || !RechartsComponents) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Platform Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } = RechartsComponents;

  const chartData = data.map((item) => ({
    name: platformConfig[item.platform]?.label || item.platform,
    value: item.count,
    percentage: item.percentage,
    color: platformConfig[item.platform]?.color || '#cbd5e1',
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900">{data.name}</p>
          <p className="text-sm text-slate-600">
            Users: <span className="font-semibold">{data.value.toLocaleString()}</span>
          </p>
          <p className="text-sm text-slate-600">
            Share: <span className="font-semibold">{data.percentage.toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Platform Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
            No platform data available
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              {chartData.map((item: any) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-slate-600">{item.name}</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {item.percentage.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
