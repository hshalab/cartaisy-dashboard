'use client';

import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag } from 'lucide-react';
import { ordersApi, OrderListItem, OrdersStats, OrdersFilters } from '@/lib/api/orders';
import { OrderStatsCards } from '@/components/orders/OrderStatsCards';
import { OrderFilters } from '@/components/orders/OrderFilters';
import { OrderTable } from '@/components/orders/OrderTable';

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [stats, setStats] = useState<OrdersStats>({
    totalOrders: 0,
    todayOrders: 0,
    unfulfilledOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    currency: 'USD',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<OrdersFilters>({
    page: 1,
    limit: 20,
    sortBy: 'date',
    sortOrder: 'desc',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ordersApi.getOrders(filters);
      setOrders(response.orders);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      setIsStatsLoading(true);
      const response = await ordersApi.getOrderStats();
      setStats(response);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleFiltersChange = (newFilters: OrdersFilters) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    fetchOrders();
    fetchStats();
  };

  const handleExport = async () => {
    try {
      const blob = await ordersApi.exportOrders(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to export orders:', err);
      alert('Failed to export orders. Please try again.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and track all your customer orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <OrderStatsCards stats={stats} isLoading={isStatsLoading} />

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <OrderFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onRefresh={handleRefresh}
          onExport={handleExport}
          isLoading={isLoading}
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <OrderTable
        orders={orders}
        pagination={pagination}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isLoading={isLoading}
      />
    </div>
  );
}
