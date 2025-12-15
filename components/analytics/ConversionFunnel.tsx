'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, ShoppingCart, CreditCard, CheckCircle } from 'lucide-react';

interface EngagementData {
  totalSessions: number;
  uniqueUsers: number;
  avgSessionDuration: number;
  screenViews: number;
  mostViewedScreens: Array<{ screen: string; views: number }>;
}

interface ConversionFunnelProps {
  data?: EngagementData;
  isLoading?: boolean;
}

export function ConversionFunnel({ data, isLoading = false }: ConversionFunnelProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Engagement Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Engagement Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
            No engagement data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const metrics = [
    {
      label: 'Total Sessions',
      value: data.totalSessions.toLocaleString(),
      icon: Eye,
    },
    {
      label: 'Unique Users',
      value: data.uniqueUsers.toLocaleString(),
      icon: ShoppingCart,
    },
    {
      label: 'Avg Session Duration',
      value: formatDuration(data.avgSessionDuration),
      icon: CreditCard,
    },
    {
      label: 'Screen Views',
      value: data.screenViews.toLocaleString(),
      icon: CheckCircle,
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Engagement Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <span className="text-sm text-slate-600">{metric.label}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">{metric.value}</span>
              </div>
            );
          })}
        </div>
        {data.mostViewedScreens && data.mostViewedScreens.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-xs font-medium text-slate-500 mb-2">Top Screens</p>
            <div className="space-y-2">
              {data.mostViewedScreens.slice(0, 3).map((screen, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-slate-600 truncate">{screen.screen}</span>
                  <span className="text-slate-900 font-medium">{screen.views.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
