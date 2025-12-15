'use client';

import { NotificationDetail } from '@/lib/api/notifications';
import { StatusBadge } from './StatusBadge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  RefreshCw,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Calendar,
  User,
  Target,
  ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationDetailModalProps {
  notification: NotificationDetail | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

const segmentLabels: Record<string, string> = {
  all: 'All Customers',
  inactive_30: 'Inactive (30 days)',
  inactive_60: 'Inactive (60 days)',
  repeat_customers: 'Repeat Customers',
  new_customers: 'New Customers',
  high_value: 'High Value',
};

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-200 rounded w-full" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="h-24 bg-slate-200 rounded-xl" />
        <div className="h-24 bg-slate-200 rounded-xl" />
        <div className="h-24 bg-slate-200 rounded-xl" />
      </div>
      <div className="h-32 bg-slate-200 rounded-xl" />
    </div>
  );
}

export function NotificationDetailModal({
  notification,
  isOpen,
  onClose,
  isLoading,
}: NotificationDetailModalProps) {
  if (!notification && !isLoading) return null;

  const isSuccess = notification?.status === 'sent';
  const isPartial = notification?.status === 'partial';
  const isFailed = notification?.status === 'failed';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        {/* Header Gradient */}
        <div
          className={cn(
            'h-2 bg-gradient-to-r',
            isSuccess && 'from-emerald-500 to-teal-500',
            isPartial && 'from-amber-500 to-orange-500',
            isFailed && 'from-red-500 to-rose-500',
            !isSuccess && !isPartial && !isFailed && 'from-blue-500 to-violet-500'
          )}
        />

        <div className="p-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : notification ? (
            <div className="space-y-6">
              {/* Header with Icon */}
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0',
                    isSuccess && 'bg-emerald-100',
                    isPartial && 'bg-amber-100',
                    isFailed && 'bg-red-100',
                    !isSuccess && !isPartial && !isFailed && 'bg-blue-100'
                  )}
                >
                  <Send
                    className={cn(
                      'w-7 h-7',
                      isSuccess && 'text-emerald-600',
                      isPartial && 'text-amber-600',
                      isFailed && 'text-red-600',
                      !isSuccess && !isPartial && !isFailed && 'text-blue-600'
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">{notification.title}</h3>
                    <StatusBadge status={notification.status} />
                  </div>
                  <p className="text-slate-600 mt-1">{notification.body}</p>
                </div>
              </div>

              {/* Image Preview */}
              {notification.imageUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  <img
                    src={notification.imageUrl}
                    alt="Notification image"
                    className="w-full h-40 object-cover"
                  />
                </div>
              )}

              {/* Delivery Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-2">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {notification.targetCount.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">Targeted</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {notification.successCount.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">Delivered</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mx-auto mb-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {notification.failureCount.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">Failed</p>
                </div>
              </div>

              {/* Delivery Rate */}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-700">Delivery Rate</span>
                  <span
                    className={cn(
                      'text-lg font-bold',
                      notification.deliveryRate >= 95
                        ? 'text-emerald-600'
                        : notification.deliveryRate >= 80
                        ? 'text-amber-600'
                        : 'text-red-600'
                    )}
                  >
                    {notification.deliveryRate.toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      notification.deliveryRate >= 95
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                        : notification.deliveryRate >= 80
                        ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                        : 'bg-gradient-to-r from-red-400 to-red-600'
                    )}
                    style={{ width: `${Math.min(notification.deliveryRate, 100)}%` }}
                  />
                </div>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Segment</p>
                    <p className="text-sm font-medium text-slate-900">
                      {segmentLabels[notification.segment] || notification.segment}
                    </p>
                  </div>
                </div>
                {notification.sentAt && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Sent At</p>
                      <p className="text-sm font-medium text-slate-900">
                        {formatDateTime(notification.sentAt)}
                      </p>
                    </div>
                  </div>
                )}
                {notification.sentByEmail && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl col-span-2">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Sent By</p>
                      <p className="text-sm font-medium text-slate-900">{notification.sentByEmail}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Failed Tokens */}
              {notification.failedTokens && notification.failedTokens.length > 0 && (
                <div className="border border-red-200 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border-b border-red-200">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-900">
                      Failed Deliveries ({notification.failedTokens.length})
                    </span>
                  </div>
                  <div className="max-h-32 overflow-y-auto p-3 space-y-2">
                    {notification.failedTokens.slice(0, 10).map((ft, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-red-700 bg-red-50 px-3 py-2 rounded-lg"
                      >
                        <XCircle className="w-3 h-3 flex-shrink-0" />
                        <span className="font-mono">{ft.errorCode}</span>
                        <span className="text-red-600">-</span>
                        <span>{ft.error}</span>
                      </div>
                    ))}
                    {notification.failedTokens.length > 10 && (
                      <p className="text-xs text-red-600 font-medium text-center py-2">
                        +{notification.failedTokens.length - 10} more failures
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
