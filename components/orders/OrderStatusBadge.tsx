'use client';

import { cn } from '@/lib/utils';
import {
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
  PaymentMethod,
} from '@/lib/api/orders';
import { CreditCard, Smartphone } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  type: 'order' | 'payment' | 'fulfillment';
  className?: string;
}

const orderStatusStyles: Record<OrderStatus, string> = {
  placed: 'bg-blue-100 text-blue-700',
  processing: 'bg-amber-100 text-amber-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

const paymentStatusStyles: Record<PaymentStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-slate-100 text-slate-700',
};

const fulfillmentStatusStyles: Record<FulfillmentStatus, string> = {
  unfulfilled: 'bg-amber-100 text-amber-700',
  partial: 'bg-blue-100 text-blue-700',
  fulfilled: 'bg-emerald-100 text-emerald-700',
  restocked: 'bg-slate-100 text-slate-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function OrderStatusBadge({ status, type, className }: StatusBadgeProps) {
  let styles = 'bg-slate-100 text-slate-700';

  if (type === 'order') {
    styles = orderStatusStyles[status as OrderStatus] || styles;
  } else if (type === 'payment') {
    styles = paymentStatusStyles[status as PaymentStatus] || styles;
  } else if (type === 'fulfillment') {
    styles = fulfillmentStatusStyles[status as FulfillmentStatus] || styles;
  }

  const formatStatus = (s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ');
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full',
        styles,
        className
      )}
    >
      {formatStatus(status)}
    </span>
  );
}

interface PaymentMethodBadgeProps {
  method?: PaymentMethod | string;
  className?: string;
}

export function PaymentMethodBadge({ method, className }: PaymentMethodBadgeProps) {
  const getMethodInfo = (m?: string) => {
    switch (m?.toLowerCase()) {
      case 'apple_pay':
        return { label: 'Apple Pay', icon: <Smartphone className="w-3 h-3" /> };
      case 'google_pay':
        return { label: 'Google Pay', icon: <Smartphone className="w-3 h-3" /> };
      case 'card':
        return { label: 'Card', icon: <CreditCard className="w-3 h-3" /> };
      case 'link':
        return { label: 'Link', icon: null };
      case 'cash':
      case 'cod':
        return { label: 'Cash', icon: null };
      default:
        return { label: m || 'Unknown', icon: null };
    }
  };

  const { label, icon } = getMethodInfo(method);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs text-slate-600',
        className
      )}
    >
      {icon}
      {label}
    </span>
  );
}
