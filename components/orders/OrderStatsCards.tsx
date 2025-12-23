'use client';

import { ShoppingBag, Clock, Package, DollarSign, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import { OrdersStats } from '@/lib/api/orders';

interface OrderStatsCardsProps {
  stats: OrdersStats;
  isLoading?: boolean;
}

export function OrderStatsCards({ stats, isLoading = false }: OrderStatsCardsProps) {
  const statItems = [
    {
      label: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      label: "Today's Orders",
      value: stats.todayOrders.toLocaleString(),
      icon: Clock,
      color: 'bg-emerald-50 text-emerald-600',
      borderColor: 'border-emerald-200',
    },
    {
      label: 'Unfulfilled',
      value: stats.unfulfilledOrders.toLocaleString(),
      icon: Package,
      color: 'bg-amber-50 text-amber-600',
      borderColor: 'border-amber-200',
      badge: stats.unfulfilledOrders > 0 ? 'Needs attention' : undefined,
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue, stats.currency),
      icon: DollarSign,
      color: 'bg-purple-50 text-purple-600',
      borderColor: 'border-purple-200',
    },
    {
      label: 'Avg. Order Value',
      value: formatCurrency(stats.averageOrderValue, stats.currency),
      icon: TrendingUp,
      color: 'bg-slate-50 text-slate-600',
      borderColor: 'border-slate-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {statItems.map((item) => (
        <div
          key={item.label}
          className={`rounded-xl border ${item.borderColor} bg-white p-4 relative`}
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
              <p className="text-xl font-bold text-slate-900">{item.value}</p>
              <p className="text-xs text-slate-500">{item.label}</p>
              {item.badge && (
                <span className="absolute top-3 right-3 px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">
                  {item.badge}
                </span>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
