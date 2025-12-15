import { NotificationStatus } from '@/lib/api/notifications';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: NotificationStatus;
}

const statusConfig: Record<NotificationStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700' },
  scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-700' },
  sending: { label: 'Sending', className: 'bg-amber-100 text-amber-700' },
  sent: { label: 'Sent', className: 'bg-emerald-100 text-emerald-700' },
  partial: { label: 'Partial', className: 'bg-orange-100 text-orange-700' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-700' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
