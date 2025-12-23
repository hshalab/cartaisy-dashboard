'use client';

import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Package, ArrowUpDown, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatCurrency';
import { OrderListItem, OrdersFilters } from '@/lib/api/orders';
import { OrderStatusBadge, PaymentMethodBadge } from './OrderStatusBadge';
import { cn } from '@/lib/utils';

interface OrderTableProps {
  orders: OrderListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: OrdersFilters;
  onFiltersChange: (filters: OrdersFilters) => void;
  isLoading?: boolean;
}

export function OrderTable({
  orders,
  pagination,
  filters,
  onFiltersChange,
  isLoading = false,
}: OrderTableProps) {
  const router = useRouter();

  const handleRowClick = (orderId: string) => {
    router.push(`/dashboard/orders/${orderId}`);
  };

  const handleSort = (sortBy: 'date' | 'total' | 'orderNumber') => {
    const newSortOrder =
      filters.sortBy === sortBy && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    onFiltersChange({ ...filters, sortBy, sortOrder: newSortOrder });
  };

  const handlePageChange = (newPage: number) => {
    onFiltersChange({ ...filters, page: newPage });
  };

  const SortButton = ({
    column,
    children,
  }: {
    column: 'date' | 'total' | 'orderNumber';
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center gap-1 hover:text-slate-900 transition-colors"
    >
      {children}
      <ArrowUpDown
        className={cn(
          'w-3 h-3',
          filters.sortBy === column ? 'text-slate-900' : 'text-slate-400'
        )}
      />
    </button>
  );

  if (isLoading && orders.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="animate-pulse p-8">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-1">No orders found</h3>
        <p className="text-slate-500 text-sm">
          Try adjusting your filters or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <SortButton column="orderNumber">Order</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <SortButton column="total">Total</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Fulfillment
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <SortButton column="date">Date</SortButton>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr
                key={order.id}
                onClick={() => handleRowClick(order.id)}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-blue-600">
                    #{order.orderNumber}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {order.customer.name}
                    </p>
                    <p className="text-xs text-slate-500">{order.customer.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {formatCurrency(order.total, order.currency)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <PaymentMethodBadge method={order.paymentMethod} />
                    <OrderStatusBadge
                      status={order.paymentStatus}
                      type="payment"
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} type="order" />
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge
                    status={order.fulfillmentStatus}
                    type="fulfillment"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {format(new Date(order.createdAt), 'MMM d, yyyy')}
                  <br />
                  <span className="text-xs text-slate-400">
                    {format(new Date(order.createdAt), 'h:mm a')}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(order.id);
                    }}
                    className="text-slate-500 hover:text-blue-600"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <p className="text-sm text-slate-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || isLoading}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-slate-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || isLoading}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
