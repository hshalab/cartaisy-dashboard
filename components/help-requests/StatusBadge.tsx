'use client';

import { cn } from '@/lib/utils';
import type { HelpRequestStatus } from '@/types/helpRequests';
import { STATUS_COLORS } from '@/types/helpRequests';

interface StatusBadgeProps {
  status: HelpRequestStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { bg, text, label } = STATUS_COLORS[status] || STATUS_COLORS.open;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full',
        bg,
        text,
        className
      )}
    >
      {label}
    </span>
  );
}
