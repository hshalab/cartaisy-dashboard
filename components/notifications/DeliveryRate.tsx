import { cn } from '@/lib/utils';

interface DeliveryRateProps {
  rate: number;
  successCount: number;
  targetCount: number;
}

export function DeliveryRate({ rate, successCount, targetCount }: DeliveryRateProps) {
  const getColorClass = () => {
    if (rate >= 95) return 'text-emerald-600';
    if (rate >= 80) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="flex flex-col">
      <span className={cn('font-semibold', getColorClass())}>{rate.toFixed(1)}%</span>
      <span className="text-xs text-slate-500">
        {successCount.toLocaleString()}/{targetCount.toLocaleString()}
      </span>
    </div>
  );
}
