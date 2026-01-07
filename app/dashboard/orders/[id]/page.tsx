'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, isValid } from 'date-fns';

// Safe date formatter
function formatDate(dateStr: string | undefined | null, formatStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (!isValid(date)) return '-';
  return format(date, formatStr);
}
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Copy,
  CreditCard,
  Truck,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatCurrency';
import { Order, ordersApi } from '@/lib/api/orders';
import { OrderStatusBadge, PaymentMethodBadge } from '@/components/orders/OrderStatusBadge';
import { FulfillOrderModal } from '@/components/orders/FulfillOrderModal';
import { CancelOrderModal } from '@/components/orders/CancelOrderModal';
import { AddNoteModal } from '@/components/orders/AddNoteModal';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFulfillModalOpen, setIsFulfillModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ordersApi.getOrder(orderId);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
  };

  const formatAddress = (addr?: {
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    country?: string;
    zip?: string;
  }) => {
    if (!addr) return '';
    const parts = [
      addr.address1,
      addr.address2,
      addr.city,
      addr.province,
      addr.zip,
      addr.country,
    ].filter(Boolean);
    return parts.join(', ');
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-red-700 mb-1">
            {error || 'Order not found'}
          </h2>
          <p className="text-red-600 text-sm mb-4">
            Unable to load order details
          </p>
          <Button variant="outline" onClick={() => router.push('/dashboard/orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const customerName = [order.customer.firstName, order.customer.lastName]
    .filter(Boolean)
    .join(' ') || 'Unknown Customer';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/orders')}
            className="text-slate-600"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Orders
          </Button>
        </div>
      </div>

      {/* Order Header Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">
                #{order.orderNumber}
              </h1>
              <OrderStatusBadge status={order.status} type="order" />
            </div>
            <p className="text-sm text-slate-500">
              Placed on {formatDate(order.createdAt, 'MMMM d, yyyy')} at{' '}
              {formatDate(order.createdAt, 'h:mm a')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {order.fulfillmentStatus === 'unfulfilled' && (
              <Button
                onClick={() => setIsFulfillModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Fulfill Order
              </Button>
            )}
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <Button
                variant="outline"
                onClick={() => setIsCancelModalOpen(true)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Cancel Order
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Order Items</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {order.lineItems.map((item, index) => (
                <div key={item.id || `item-${index}`} className="p-4 flex gap-4">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productTitle}
                      className="w-16 h-16 rounded-lg object-cover bg-slate-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Package className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {item.productTitle}
                    </p>
                    {item.variantTitle && (
                      <p className="text-sm text-slate-500">{item.variantTitle}</p>
                    )}
                    {item.sku && (
                      <p className="text-xs text-slate-400 mt-1">SKU: {item.sku}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">
                      {formatCurrency(item.totalPrice, item.currency)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatCurrency(item.unitPrice, item.currency)} x {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* Price Summary */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2 rounded-b-xl">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="text-slate-900">
                  {formatCurrency(order.subtotal, order.currency)}
                </span>
              </div>
              {order.shippingTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    Shipping {order.shippingMethod && `(${order.shippingMethod})`}
                  </span>
                  <span className="text-slate-900">
                    {formatCurrency(order.shippingTotal, order.currency)}
                  </span>
                </div>
              )}
              {order.taxTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax</span>
                  <span className="text-slate-900">
                    {formatCurrency(order.taxTotal, order.currency)}
                  </span>
                </div>
              )}
              {order.discountTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Discount</span>
                  <span className="text-emerald-600">
                    -{formatCurrency(order.discountTotal, order.currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="font-bold text-lg text-slate-900">
                  {formatCurrency(order.total, order.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Order Timeline</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsNoteModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Note
              </Button>
            </div>
            <div className="p-4">
              {order.timeline && order.timeline.length > 0 ? (
                <div className="space-y-4">
                  {order.timeline.map((event, index) => (
                    <div key={event.id || index} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-900">{event.message}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {formatDate(event.createdAt, 'MMM d, yyyy h:mm a')}
                          {event.createdBy && ` by ${event.createdBy}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-sm">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No timeline events yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Right */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="font-semibold text-slate-900 mb-3">Customer</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <Link
                  href={`/dashboard/customers/${order.customer.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {customerName}
                </Link>
              </div>
              {order.customer.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <a
                    href={`mailto:${order.customer.email}`}
                    className="text-sm text-slate-600 hover:text-slate-900"
                  >
                    {order.customer.email}
                  </a>
                </div>
              )}
              {order.customer.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <a
                    href={`tel:${order.customer.phone}`}
                    className="text-sm text-slate-600 hover:text-slate-900"
                  >
                    {order.customer.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-slate-900">Shipping Address</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleCopyAddress(formatAddress(order.shippingAddress))
                  }
                  className="text-slate-500 h-7"
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                <div className="text-sm text-slate-600">
                  {order.shippingAddress.firstName && order.shippingAddress.lastName && (
                    <p className="font-medium text-slate-900">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </p>
                  )}
                  {order.shippingAddress.address1 && <p>{order.shippingAddress.address1}</p>}
                  {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                  <p>
                    {[
                      order.shippingAddress.city,
                      order.shippingAddress.province,
                      order.shippingAddress.zip,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  {order.shippingAddress.country && <p>{order.shippingAddress.country}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Payment */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="font-semibold text-slate-900 mb-3">Payment</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Method</span>
                <PaymentMethodBadge method={order.paymentMethod} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Status</span>
                <OrderStatusBadge status={order.paymentStatus} type="payment" />
              </div>
              {order.paymentGateway && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Gateway</span>
                  <span className="text-sm text-slate-900 capitalize">
                    {order.paymentGateway}
                  </span>
                </div>
              )}
              {order.transactionId && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Transaction</span>
                  <span className="text-xs text-slate-500 font-mono">
                    {order.transactionId}
                  </span>
                </div>
              )}
              {order.cardBrand && order.cardLast4 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Card</span>
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-900">
                      {order.cardBrand} ****{order.cardLast4}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fulfillment */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="font-semibold text-slate-900 mb-3">Fulfillment</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Status</span>
                <OrderStatusBadge
                  status={order.fulfillmentStatus}
                  type="fulfillment"
                />
              </div>
              {order.trackingNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Tracking #</span>
                  <span className="text-sm text-slate-900 font-mono">
                    {order.trackingNumber}
                  </span>
                </div>
              )}
              {order.trackingCompany && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Carrier</span>
                  <span className="text-sm text-slate-900">
                    {order.trackingCompany}
                  </span>
                </div>
              )}
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <Truck className="w-4 h-4" />
                  Track Package
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Cancellation Reason - Only shown for cancelled orders */}
          {order.status === 'cancelled' && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-4 h-4 text-red-500" />
                <h2 className="font-semibold text-red-700">Cancellation Reason</h2>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-red-700">
                  {order.cancellationReason || 'No reason provided'}
                </p>
                {order.cancelledAt && (
                  <p className="text-xs text-red-500">
                    Cancelled on {formatDate(order.cancelledAt, 'MMM d, yyyy')} at{' '}
                    {formatDate(order.cancelledAt, 'h:mm a')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && order.notes.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="font-semibold text-slate-900 mb-3">Notes</h2>
              <div className="space-y-3">
                {order.notes.map((note, index) => (
                  <div key={note.id || index} className="text-sm">
                    <p className="text-slate-700">{note.content}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(note.createdAt, 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <FulfillOrderModal
        isOpen={isFulfillModalOpen}
        onClose={() => setIsFulfillModalOpen(false)}
        orderId={order.id}
        onSuccess={fetchOrder}
      />
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        orderId={order.id}
        onSuccess={fetchOrder}
      />
      <AddNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        orderId={order.id}
        onSuccess={fetchOrder}
      />
    </div>
  );
}
