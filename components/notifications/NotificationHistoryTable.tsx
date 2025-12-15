'use client';

import { NotificationHistoryItem } from '@/lib/api/notifications';
import { StatusBadge } from './StatusBadge';
import { DeliveryRate } from './DeliveryRate';
import { Bell, Eye, Send, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NotificationHistoryTableProps {
  notifications: NotificationHistoryItem[];
  onViewDetails: (id: string) => void;
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

function formatDate(dateString: string): { date: string; time: string } {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
  };
}

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 animate-pulse">
          <div className="w-12 h-12 rounded-xl bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
          </div>
          <div className="w-20 h-8 bg-slate-200 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 px-6">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-6">
        <Bell className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">No notifications yet</h3>
      <p className="text-slate-500 max-w-md mx-auto mb-6">
        Start engaging your customers by sending your first push notification. It's a great way to drive sales and build loyalty.
      </p>
      <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
        <Send className="w-4 h-4" />
        <span>Go to "Send Notification" tab to get started</span>
      </div>
    </div>
  );
}

export function NotificationHistoryTable({
  notifications,
  onViewDetails,
  isLoading,
}: NotificationHistoryTableProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (notifications.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="divide-y divide-slate-100">
      {/* Header - Desktop only */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3 bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wider">
        <div className="col-span-4">Notification</div>
        <div className="col-span-2">Segment</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Delivery</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {/* Notification Rows */}
      {notifications.map((notification, idx) => {
        const sentDate = notification.sentAt ? formatDate(notification.sentAt) : null;
        const isSuccess = notification.status === 'sent';
        const isPartial = notification.status === 'partial';
        const isFailed = notification.status === 'failed';

        return (
          <div
            key={notification.id}
            className={cn(
              'group px-6 py-4 hover:bg-slate-50/80 transition-colors cursor-pointer',
              idx === 0 && 'lg:rounded-t-none'
            )}
            onClick={() => onViewDetails(notification.id)}
          >
            {/* Mobile Layout */}
            <div className="lg:hidden space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                      isSuccess && 'bg-emerald-100',
                      isPartial && 'bg-amber-100',
                      isFailed && 'bg-red-100',
                      !isSuccess && !isPartial && !isFailed && 'bg-slate-100'
                    )}
                  >
                    <Send
                      className={cn(
                        'w-5 h-5',
                        isSuccess && 'text-emerald-600',
                        isPartial && 'text-amber-600',
                        isFailed && 'text-red-600',
                        !isSuccess && !isPartial && !isFailed && 'text-slate-600'
                      )}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{notification.title}</p>
                    <p className="text-sm text-slate-500 truncate">{notification.body}</p>
                  </div>
                </div>
                <StatusBadge status={notification.status} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-slate-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {segmentLabels[notification.segment] || notification.segment}
                  </span>
                  {sentDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {sentDate.date}
                    </span>
                  )}
                </div>
                <DeliveryRate
                  rate={notification.deliveryRate}
                  successCount={notification.successCount}
                  targetCount={notification.targetCount}
                />
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
              {/* Notification */}
              <div className="col-span-4 flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    isSuccess && 'bg-emerald-100',
                    isPartial && 'bg-amber-100',
                    isFailed && 'bg-red-100',
                    !isSuccess && !isPartial && !isFailed && 'bg-slate-100'
                  )}
                >
                  <Send
                    className={cn(
                      'w-5 h-5',
                      isSuccess && 'text-emerald-600',
                      isPartial && 'text-amber-600',
                      isFailed && 'text-red-600',
                      !isSuccess && !isPartial && !isFailed && 'text-slate-600'
                    )}
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 truncate">{notification.title}</p>
                  <p className="text-sm text-slate-500 truncate">{notification.body}</p>
                </div>
              </div>

              {/* Segment */}
              <div className="col-span-2">
                <span className="text-sm text-slate-600">
                  {segmentLabels[notification.segment] || notification.segment}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-2 flex flex-col gap-1">
                <StatusBadge status={notification.status} />
                {sentDate && (
                  <span className="text-xs text-slate-400">
                    {sentDate.date} at {sentDate.time}
                  </span>
                )}
              </div>

              {/* Delivery */}
              <div className="col-span-2">
                <DeliveryRate
                  rate={notification.deliveryRate}
                  successCount={notification.successCount}
                  targetCount={notification.targetCount}
                />
              </div>

              {/* Actions */}
              <div className="col-span-2 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(notification.id);
                  }}
                  className="text-slate-600 hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Eye className="w-4 h-4 mr-1.5" />
                  View Details
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
