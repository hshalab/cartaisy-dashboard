'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerOrder, customersApi } from '@/lib/api/customers';
import { format } from 'date-fns';
import { Package, ChevronLeft, ChevronRight, Loader2, ShoppingBag, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';

interface CustomerOrderHistoryProps {
  customerId: string;
}

function getStatusColor(status: string | undefined | null): string {
  if (!status) return 'bg-slate-100 text-slate-700';
  switch (status.toLowerCase()) {
    case 'paid':
    case 'fulfilled':
      return 'bg-emerald-100 text-emerald-700';
    case 'pending':
    case 'unfulfilled':
      return 'bg-amber-100 text-amber-700';
    case 'refunded':
    case 'cancelled':
    case 'failed':
    case 'restocked':
      return 'bg-red-100 text-red-700';
    case 'partial':
    case 'partially_paid':
    case 'partially_fulfilled':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

function formatPaymentMethod(method: string | undefined | null): string {
  if (!method) return '-';
  switch (method.toLowerCase()) {
    case 'apple_pay': return 'Apple Pay';
    case 'google_pay': return 'Google Pay';
    case 'card': return 'Card';
    case 'link': return 'Link';
    case 'cash': return 'Cash';
    case 'cod': return 'COD';
    default: return method.charAt(0).toUpperCase() + method.slice(1);
  }
}

function formatFulfillmentStatus(status: string | undefined | null): string {
  if (!status) return '-';
  switch (status.toLowerCase()) {
    case 'unfulfilled': return 'Unfulfilled';
    case 'partial': return 'Partial';
    case 'fulfilled': return 'Fulfilled';
    case 'restocked': return 'Restocked';
    case 'cancelled': return 'Cancelled';
    default: return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  }
}

export function CustomerOrderHistory({ customerId }: CustomerOrderHistoryProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const limit = 10;

  const handleRowClick = (orderId: string) => {
    router.push(`/dashboard/orders/${orderId}`);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await customersApi.getCustomerOrders(customerId, page, limit);
        setOrders(data.orders);
        setTotal(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [customerId, page]);

  const totalPages = Math.ceil(total / limit);

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-1">No orders yet</h3>
        <p className="text-slate-500">This customer hasn&apos;t placed any orders.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Order</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Items</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Payment</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fulfillment</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
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
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-blue-600">#{order.orderNumber}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {format(new Date(order.createdAt), 'MMM d, yyyy')}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {order.itemCount ?? '-'} {order.itemCount ? (order.itemCount !== 1 ? 'items' : 'item') : ''}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {formatCurrency(order.totalPrice, order.currency)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-600">
                      {formatPaymentMethod(order.paymentMethod)}
                    </span>
                    <span className={cn(
                      'px-2 py-0.5 text-xs font-medium rounded-full w-fit',
                      getStatusColor(order.paymentStatus || order.financialStatus)
                    )}>
                      {(order.paymentStatus || order.financialStatus || 'N/A').replace('_', ' ')}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    'px-2 py-1 text-xs font-medium rounded-full',
                    getStatusColor(order.fulfillmentStatus)
                  )}>
                    {formatFulfillmentStatus(order.fulfillmentStatus)}
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
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <p className="text-sm text-slate-600">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-slate-600 px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page === totalPages || isLoading}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
