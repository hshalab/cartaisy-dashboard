'use client';

import { useState, useEffect, useCallback } from 'react';

interface SalesData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalItemsSold: number;
  currency: string;
  /** Whether revenue includes orders from multiple currencies (converted to base) */
  isMultiCurrency?: boolean;
  /** List of currencies included in the revenue if multi-currency */
  includedCurrencies?: string[];
}

interface TopProduct {
  productId: string;
  title: string;
  totalSold: number;
  totalRevenue: number;
  image?: string;
}

interface CustomerMetrics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  repeatPurchaseRate: number;
}

interface SalesTrend {
  date: string;
  orders: number;
  revenue: number;
}

interface RecentOrder {
  orderId: string;
  orderNumber: string;
  customer: string;
  totalPrice: number;
  currency?: string;
  status: string;
  placedAt: string;
}

interface LowStockProduct {
  productId: string;
  title: string;
  image?: string;
  quantity: number;
  threshold: number;
}

interface EngagementData {
  totalSessions: number;
  uniqueUsers: number;
  avgSessionDuration: number;
  screenViews: number;
  mostViewedScreens: Array<{ screen: string; views: number }>;
}

interface TopViewedProduct {
  productId: string;
  views: number;
  clicks: number;
  addToCart: number;
  conversionRate: number;
}

interface TopSearch {
  query: string;
  count: number;
  avgResultsCount: number;
}

interface PlatformBreakdown {
  platform: 'ios' | 'android' | 'web';
  count: number;
  percentage: number;
}

interface HourlyActivity {
  hour: number;
  events: number;
}

interface FunnelData {
  views: number;
  addToCart: number;
  checkout: number;
  purchase: number;
}

export interface AnalyticsDashboard {
  sales: SalesData;
  topSellingProducts: TopProduct[];
  customers: CustomerMetrics;
  salesTrends: SalesTrend[];
  recentOrders: RecentOrder[];
  lowStockProducts: LowStockProduct[];
  engagement: EngagementData;
  topViewedProducts: TopViewedProduct[];
  topSearches: TopSearch[];
  platformBreakdown: PlatformBreakdown[];
  hourlyActivity: HourlyActivity[];
}

interface UseAnalyticsOptions {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export function useAnalyticsDashboard(options: UseAnalyticsOptions = {}) {
  const [data, setData] = useState<AnalyticsDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);
      if (options.limit) params.append('limit', options.limit.toString());

      const response = await fetch(`/api/analytics/dashboard?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();
      setData(result.data || result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, [options.startDate, options.endDate, options.limit]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, isLoading, error, refetch: fetchDashboard };
}

export function useConversionFunnel(options: UseAnalyticsOptions = {}) {
  const [data, setData] = useState<FunnelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFunnel = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (options.startDate) params.append('startDate', options.startDate);
        if (options.endDate) params.append('endDate', options.endDate);

        const response = await fetch(`/api/analytics/funnel?${params}`);

        if (!response.ok) throw new Error('Failed to fetch funnel data');

        const result = await response.json();
        setData(result.data || result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load funnel');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFunnel();
  }, [options.startDate, options.endDate]);

  return { data, isLoading, error };
}

// App Engagement Types
export interface AppEngagementData {
  /** Daily Active Users */
  dau: number;
  /** DAU change percentage vs yesterday */
  dauChange: number;
  /** Monthly Active Users (30-day rolling) */
  mau: number;
  /** MAU change percentage vs previous 30 days */
  mauChange: number;
  /** Average session duration in seconds */
  avgSessionDuration: number;
  /** Session duration change percentage */
  sessionDurationChange: number;
  /** Total sessions in the period */
  totalSessions: number;
  /** Sessions change percentage */
  sessionsChange: number;
  /** Daily active users trend over the date range */
  dauTrend: Array<{
    date: string;
    users: number;
  }>;
}

export function useAppEngagement(options: UseAnalyticsOptions = {}) {
  const [data, setData] = useState<AppEngagementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEngagement = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);

      const response = await fetch(`/api/analytics/app-engagement?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch app engagement data');
      }

      const result = await response.json();
      setData(result.data || result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load app engagement');
    } finally {
      setIsLoading(false);
    }
  }, [options.startDate, options.endDate]);

  useEffect(() => {
    fetchEngagement();
  }, [fetchEngagement]);

  return { data, isLoading, error, refetch: fetchEngagement };
}
