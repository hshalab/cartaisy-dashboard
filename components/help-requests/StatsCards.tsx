'use client';

import { AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { HelpRequestsStatusCounts, HelpRequestStatus } from '@/types/helpRequests';

interface StatsCardsProps {
  statusCounts: HelpRequestsStatusCounts;
  isLoading?: boolean;
  selectedStatus?: HelpRequestStatus | 'all';
  onStatusClick?: (status: HelpRequestStatus | 'all') => void;
}

export function StatsCards({
  statusCounts,
  isLoading = false,
  selectedStatus,
  onStatusClick
}: StatsCardsProps) {
  const statItems = [
    {
      key: 'open' as const,
      label: 'Open',
      value: statusCounts.open,
      icon: AlertCircle,
      color: 'bg-red-50 text-red-600',
      borderColor: 'border-red-200',
      selectedBorderColor: 'border-red-500',
      urgent: statusCounts.open > 0,
    },
    {
      key: 'in_progress' as const,
      label: 'In Progress',
      value: statusCounts.in_progress,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600',
      borderColor: 'border-amber-200',
      selectedBorderColor: 'border-amber-500',
    },
    {
      key: 'resolved' as const,
      label: 'Resolved',
      value: statusCounts.resolved,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-600',
      borderColor: 'border-green-200',
      selectedBorderColor: 'border-green-500',
    },
    {
      key: 'closed' as const,
      label: 'Closed',
      value: statusCounts.closed,
      icon: XCircle,
      color: 'bg-slate-50 text-slate-600',
      borderColor: 'border-slate-200',
      selectedBorderColor: 'border-slate-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item) => {
        const isSelected = selectedStatus === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onStatusClick?.(isSelected ? 'all' : item.key)}
            className={`rounded-xl border-2 bg-white p-4 relative text-left transition-all hover:shadow-md ${
              isSelected ? item.selectedBorderColor : item.borderColor
            } ${isSelected ? 'ring-2 ring-offset-2' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 w-8 bg-slate-200 rounded-lg mb-3" />
                <div className="h-6 w-16 bg-slate-200 rounded mb-1" />
                <div className="h-4 w-20 bg-slate-100 rounded" />
              </div>
            ) : (
              <>
                <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center mb-3`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{item.value.toLocaleString()}</p>
                <p className="text-xs text-slate-500">{item.label}</p>
                {item.urgent && (
                  <span className="absolute top-3 right-3 px-1.5 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 rounded animate-pulse">
                    Needs attention
                  </span>
                )}
                {isSelected && (
                  <span className="absolute top-3 right-3 px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 rounded">
                    Filtered
                  </span>
                )}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
