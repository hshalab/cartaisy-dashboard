'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Users, Bell, AlertTriangle } from 'lucide-react';
import { NotificationStats } from '@/lib/api/notifications';

interface NotificationStatsProps {
  stats: NotificationStats;
  detailed?: boolean;
}

export default function NotificationStatsCard({ stats, detailed = false }: NotificationStatsProps) {
  const iosPercentage = stats.totalActiveDevices > 0
    ? Math.round((stats.platformBreakdown.ios / stats.totalActiveDevices) * 100)
    : 0;

  const androidPercentage = stats.totalActiveDevices > 0
    ? Math.round((stats.platformBreakdown.android / stats.totalActiveDevices) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Customers with Devices
            </CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {stats.totalCustomersWithDevices.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Can receive push notifications
            </p>
          </CardContent>
        </Card>

        {/* Total Devices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Active Devices
            </CardTitle>
            <Smartphone className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {stats.totalActiveDevices.toLocaleString()}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-slate-500">
                iOS: {stats.platformBreakdown.ios.toLocaleString()} ({iosPercentage}%)
              </span>
              <span className="text-xs text-slate-500">
                Android: {stats.platformBreakdown.android.toLocaleString()} ({androidPercentage}%)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Push Enabled */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Push Enabled
            </CardTitle>
            <Bell className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {stats.pushEnabledCustomers.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Customers opted in
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Breakdown (Detailed View) */}
      {detailed && (
        <Card>
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* iOS Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-600" />
                    <span className="text-sm font-medium text-slate-700">iOS</span>
                  </div>
                  <span className="text-sm text-slate-500">
                    {stats.platformBreakdown.ios.toLocaleString()} devices ({iosPercentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${iosPercentage}%` }}
                  />
                </div>
              </div>

              {/* Android Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-600" />
                    <span className="text-sm font-medium text-slate-700">Android</span>
                  </div>
                  <span className="text-sm text-slate-500">
                    {stats.platformBreakdown.android.toLocaleString()} devices ({androidPercentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${androidPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Total Active Devices</span>
                <span className="font-semibold text-slate-900">
                  {stats.totalActiveDevices.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Firebase Status */}
      {!stats.firebaseEnabled && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Firebase is not configured
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Push notifications are disabled. Please add FIREBASE_SERVICE_ACCOUNT to environment variables.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
