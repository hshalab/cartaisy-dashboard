'use client';

import { useState, useMemo } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  BarChart3,
  Calendar,
  Activity,
  Package,
  Search,
  Clock,
  Info,
  Smartphone,
} from 'lucide-react';
import { formatCurrency, getCurrencySymbol } from '@/lib/formatCurrency';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SalesChart } from '@/components/analytics/SalesChart';
import { TopProductsCard } from '@/components/analytics/TopProductsCard';
import { RecentOrdersCard } from '@/components/analytics/RecentOrdersCard';
import { PlatformChart } from '@/components/analytics/PlatformChart';
import { ConversionFunnel } from '@/components/analytics/ConversionFunnel';
import { LowStockCard } from '@/components/analytics/LowStockCard';
import { TopSearchesCard } from '@/components/analytics/TopSearchesCard';
import { HourlyActivityChart } from '@/components/analytics/HourlyActivityChart';
import { AppEngagementCards } from '@/components/analytics/AppEngagementCards';
import { ActiveUsersChart } from '@/components/analytics/ActiveUsersChart';
import { useAnalyticsDashboard, useAppEngagement } from '@/hooks/useAnalytics';

interface StatCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ElementType;
  prefix?: string;
  suffix?: string;
  isLoading?: boolean;
  color: 'blue' | 'emerald' | 'violet' | 'amber';
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  prefix = '',
  suffix = '',
  isLoading = false,
  color,
}: StatCardProps) {
  const isPositive = change !== undefined ? change >= 0 : true;

  const colorClasses = {
    blue: { bg: 'bg-blue-100', icon: 'text-blue-600', gradient: 'from-blue-50 to-blue-100/50' },
    emerald: { bg: 'bg-emerald-100', icon: 'text-emerald-600', gradient: 'from-emerald-50 to-emerald-100/50' },
    violet: { bg: 'bg-violet-100', icon: 'text-violet-600', gradient: 'from-violet-50 to-violet-100/50' },
    amber: { bg: 'bg-amber-100', icon: 'text-amber-600', gradient: 'from-amber-50 to-amber-100/50' },
  };

  const colors = colorClasses[color];

  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br ${colors.gradient} p-5`}>
      {isLoading ? (
        <div className="flex items-center justify-center h-20">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
              <p className="text-2xl font-semibold tracking-tight text-slate-900 mt-1.5">
                {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
              </p>
              {change !== undefined && (
                <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                  <div className={`flex items-center justify-center w-4 h-4 rounded-full ${isPositive ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    {isPositive ? (
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    ) : (
                      <ArrowDownRight className="w-2.5 h-2.5" />
                    )}
                  </div>
                  <span>{Math.abs(change).toFixed(1)}%</span>
                  <span className="text-slate-500 font-normal">vs last period</span>
                </div>
              )}
            </div>
            <div className={`w-11 h-11 ${colors.bg} rounded-xl flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${colors.icon}`} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getDateRange(range: string): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();

  switch (range) {
    case 'today':
      break;
    case '7d':
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      break;
    case '90d':
      start.setDate(start.getDate() - 90);
      break;
    case '12m':
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      start.setDate(start.getDate() - 7);
  }

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

const dateRangeOptions = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '12m', label: 'Last 12 months' },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7d');

  const { startDate, endDate } = useMemo(() => getDateRange(dateRange), [dateRange]);

  const { data, isLoading, error, refetch } = useAnalyticsDashboard({
    startDate,
    endDate,
    limit: 10,
  });

  const {
    data: appEngagement,
    isLoading: engagementLoading,
  } = useAppEngagement({
    startDate,
    endDate,
  });

  const salesChartData = useMemo(() => {
    if (!data?.salesTrends) return [];
    return data.salesTrends.map(trend => ({
      name: new Date(trend.date).toLocaleDateString('en-US', { weekday: 'short' }),
      sales: trend.revenue,
      orders: trend.orders,
    }));
  }, [data?.salesTrends]);

  const topProducts = useMemo(() => {
    if (!data?.topSellingProducts) return [];
    return data.topSellingProducts.map(product => ({
      id: product.productId,
      name: product.title,
      sales: product.totalRevenue,
      quantity: product.totalSold,
      image: product.image,
    }));
  }, [data?.topSellingProducts]);

  const recentOrders = useMemo(() => {
    if (!data?.recentOrders) return [];
    return data.recentOrders.map(order => ({
      id: order.orderNumber,
      customer: order.customer,
      email: '',
      total: order.totalPrice,
      currency: order.currency || data?.sales?.currency || 'USD',
      status: order.status.toLowerCase() as 'pending' | 'processing' | 'completed' | 'cancelled',
      date: order.placedAt,
    }));
  }, [data?.recentOrders, data?.sales?.currency]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 pb-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-1.5 text-violet-400 text-xs font-medium mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">
              Store Performance
            </h1>
            <p className="text-slate-400 text-sm">
              Track sales, customers, and growth metrics
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-sm font-semibold text-red-900 mb-1">Failed to load analytics</h3>
            <p className="text-xs text-red-700 mb-4 max-w-md">{error}</p>
            <Button onClick={refetch} variant="outline" size="sm" className="gap-1.5 text-sm">
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-1.5 text-violet-400 text-xs font-medium mb-2">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Analytics</span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">
                Store Performance
              </h1>
              <p className="text-slate-400 text-sm max-w-xl">
                Track sales, customers, and growth metrics for your mobile commerce store.
              </p>
            </div>

            {/* Quick Stats in Header */}
            <div className="flex gap-5">
              <div className="text-center">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-1.5">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-xl font-semibold text-white">
                  {formatCurrency(data?.sales?.totalRevenue ?? 0, data?.sales?.currency || 'USD')}
                </p>
                <p className="text-xs font-medium text-slate-400">
                  Revenue {data?.sales?.currency && data.sales.currency !== 'USD' && `(${data.sales.currency})`}
                </p>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-1.5">
                  <ShoppingCart className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-xl font-semibold text-white">
                  {(data?.sales?.totalOrders ?? 0).toLocaleString()}
                </p>
                <p className="text-xs font-medium text-slate-400">Orders</p>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-1.5">
                  <Users className="w-5 h-5 text-violet-400" />
                </div>
                <p className="text-xl font-semibold text-white">
                  {(data?.customers?.totalCustomers ?? 0).toLocaleString()}
                </p>
                <p className="text-xs font-medium text-slate-400">Customers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-100 text-slate-600">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">
              {dateRangeOptions.find(opt => opt.value === dateRange)?.label}
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {startDate} to {endDate}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map(option => (
                <SelectItem key={option.value} value={option.value} className="text-xs">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={refetch} variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">Key Metrics</h2>
          </div>
          {data?.sales?.currency && (
            <span className="text-xs text-slate-500">
              Currency: {data.sales.currency}
            </span>
          )}
        </div>

        {/* Multi-currency notice */}
        {data?.sales?.isMultiCurrency && (
          <div className="mb-3 p-2.5 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                Revenue shown in {data.sales.currency}. Amounts converted from original transaction currencies
                {data.sales.includedCurrencies && data.sales.includedCurrencies.length > 0 && (
                  <span> ({data.sales.includedCurrencies.join(', ')})</span>
                )}.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(data?.sales?.totalRevenue ?? 0, data?.sales?.currency || 'USD')}
            icon={DollarSign}
            color="emerald"
          />
          <StatCard
            title="Total Orders"
            value={data?.sales?.totalOrders ?? 0}
            icon={ShoppingCart}
            color="blue"
          />
          <StatCard
            title="Total Customers"
            value={data?.customers?.totalCustomers ?? 0}
            icon={Users}
            color="violet"
          />
          <StatCard
            title="Avg Order Value"
            value={formatCurrency(data?.sales?.averageOrderValue ?? 0, data?.sales?.currency || 'USD')}
            icon={TrendingUp}
            color="amber"
          />
        </div>
      </div>

      {/* App Engagement Section */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <Smartphone className="w-4 h-4 text-slate-600" />
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">App Engagement</h2>
        </div>
        <AppEngagementCards data={appEngagement} isLoading={engagementLoading} />
      </div>

      {/* Charts Row */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Sales Overview</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Revenue and orders over time</p>
            </div>
            <div className="p-5">
              <SalesChart data={salesChartData} isLoading={isLoading} />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Package className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-900">Top Products</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Best selling items</p>
          </div>
          <div className="p-4">
            <TopProductsCard products={topProducts} currency={data?.sales?.currency || 'USD'} isLoading={isLoading} />
          </div>
        </div>
      </div>

      {/* Active Users Chart */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <ActiveUsersChart
          data={appEngagement?.dauTrend ?? []}
          isLoading={engagementLoading}
        />
      </div>

      {/* Second Row */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-900">Platform Breakdown</h3>
            </div>
          </div>
          <div className="p-4">
            <PlatformChart data={data?.platformBreakdown ?? []} isLoading={isLoading} />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-900">Conversion Funnel</h3>
            </div>
          </div>
          <div className="p-4">
            <ConversionFunnel data={data?.engagement} isLoading={isLoading} />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-900">Hourly Activity</h3>
            </div>
          </div>
          <div className="p-4">
            <HourlyActivityChart data={data?.hourlyActivity ?? []} isLoading={isLoading} />
          </div>
        </div>
      </div>

      {/* Third Row */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Search className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-900">Top Searches</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">What customers are looking for</p>
          </div>
          <div className="p-4">
            <TopSearchesCard searches={data?.topSearches ?? []} isLoading={isLoading} />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-slate-900">Low Stock Alert</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Products that need restocking</p>
          </div>
          <div className="p-4">
            <LowStockCard products={data?.lowStockProducts ?? []} isLoading={isLoading} />
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Recent Orders</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Latest customer orders</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <RecentOrdersCard orders={recentOrders} isLoading={isLoading} />
        </div>
      </div>

      {/* Pro Tips */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-violet-50 to-purple-50 p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-violet-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900 mb-0.5">Analytics Insights</h3>
            <p className="text-xs text-slate-500">
              Monitor your key metrics regularly to identify trends. Use the date range selector to compare
              different time periods and track your store's growth over time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
