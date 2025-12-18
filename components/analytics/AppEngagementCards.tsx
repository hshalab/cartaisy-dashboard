'use client';

import {
  Users,
  UserCheck,
  Clock,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AppEngagementData } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';

interface AppEngagementCardsProps {
  data: AppEngagementData | null;
  isLoading?: boolean;
}

interface EngagementCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  tooltip: string;
  color: 'blue' | 'violet' | 'emerald' | 'amber';
  isLoading?: boolean;
}

/**
 * Format seconds into a human-readable duration string
 * e.g., 252 seconds -> "4m 12s"
 */
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${hours}h`;
}

function EngagementCard({
  title,
  value,
  change,
  icon: Icon,
  tooltip,
  color,
  isLoading = false,
}: EngagementCardProps) {
  const isPositive = change !== undefined ? change >= 0 : true;

  const colorClasses = {
    blue: { bg: 'bg-blue-100', icon: 'text-blue-600', gradient: 'from-blue-50 to-blue-100/50' },
    violet: { bg: 'bg-violet-100', icon: 'text-violet-600', gradient: 'from-violet-50 to-violet-100/50' },
    emerald: { bg: 'bg-emerald-100', icon: 'text-emerald-600', gradient: 'from-emerald-50 to-emerald-100/50' },
    amber: { bg: 'bg-amber-100', icon: 'text-amber-600', gradient: 'from-amber-50 to-amber-100/50' },
  };

  const colors = colorClasses[color];

  if (isLoading) {
    return (
      <div className={`relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br ${colors.gradient} p-6`}>
        <div className="flex items-center justify-center h-24">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br ${colors.gradient} p-6`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-sm">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change !== undefined && (
            <div className={cn(
              'flex items-center gap-1.5 mt-3 text-sm font-medium',
              isPositive ? 'text-emerald-600' : 'text-red-600'
            )}>
              <div className={cn(
                'flex items-center justify-center w-5 h-5 rounded-full',
                isPositive ? 'bg-emerald-100' : 'bg-red-100'
              )}>
                {isPositive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
              </div>
              <span>{Math.abs(change).toFixed(1)}%</span>
              <span className="text-slate-500 font-normal">vs previous</span>
            </div>
          )}
        </div>
        <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center', colors.bg)}>
          <Icon className={cn('w-7 h-7', colors.icon)} />
        </div>
      </div>
    </div>
  );
}

export function AppEngagementCards({ data, isLoading = false }: AppEngagementCardsProps) {
  // Show empty state if no data and not loading
  if (!data && !isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Daily Active Users', icon: Users, color: 'blue' as const },
          { title: 'Monthly Active Users', icon: UserCheck, color: 'violet' as const },
          { title: 'Avg Session Duration', icon: Clock, color: 'emerald' as const },
          { title: 'Total Sessions', icon: Activity, color: 'amber' as const },
        ].map((card) => (
          <div
            key={card.title}
            className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <p className="text-2xl font-bold text-slate-400 mt-2">--</p>
                <p className="text-sm text-slate-400 mt-3">No data yet</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                <card.icon className="w-7 h-7 text-slate-400" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <EngagementCard
        title="Daily Active Users"
        value={data?.dau ?? 0}
        change={data?.dauChange}
        icon={Users}
        tooltip="Number of unique users who opened the app today. A key indicator of daily engagement."
        color="blue"
        isLoading={isLoading}
      />
      <EngagementCard
        title="Monthly Active Users"
        value={data?.mau ?? 0}
        change={data?.mauChange}
        icon={UserCheck}
        tooltip="Unique users who engaged with the app in the last 30 days. Shows your active user base size."
        color="violet"
        isLoading={isLoading}
      />
      <EngagementCard
        title="Avg Session Duration"
        value={formatDuration(data?.avgSessionDuration ?? 0)}
        change={data?.sessionDurationChange}
        icon={Clock}
        tooltip="Average time users spend in each app session. Longer sessions often indicate better engagement."
        color="emerald"
        isLoading={isLoading}
      />
      <EngagementCard
        title="Total Sessions"
        value={data?.totalSessions ?? 0}
        change={data?.sessionsChange}
        icon={Activity}
        tooltip="Total number of app sessions in the selected period. Each time a user opens the app counts as one session."
        color="amber"
        isLoading={isLoading}
      />
    </div>
  );
}
