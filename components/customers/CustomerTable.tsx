'use client';

import { Customer } from '@/lib/api/customers';
import { formatDistanceToNow } from 'date-fns';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronRight, Mail, Phone, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';

interface CustomerTableProps {
  customers: Customer[];
  onRowClick: (customerId: string) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort: (column: string) => void;
  isLoading?: boolean;
}

interface SortableHeaderProps {
  label: string;
  column: string;
  currentSort?: string;
  sortOrder?: 'asc' | 'desc';
  onSort: (column: string) => void;
}

function SortableHeader({ label, column, currentSort, sortOrder, onSort }: SortableHeaderProps) {
  const isActive = currentSort === column;

  return (
    <button
      onClick={() => onSort(column)}
      className="flex items-center gap-1.5 text-left font-medium text-slate-600 hover:text-slate-900 transition-colors group"
    >
      {label}
      <span className={cn(
        'transition-colors',
        isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'
      )}>
        {isActive ? (
          sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
        ) : (
          <ArrowUpDown className="w-4 h-4" />
        )}
      </span>
    </button>
  );
}

function getCustomerName(customer: Customer): string {
  if (customer.firstName || customer.lastName) {
    return `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
  }
  return customer.email.split('@')[0];
}

export function CustomerTable({
  customers,
  onRowClick,
  sortBy,
  sortOrder,
  onSort,
  isLoading
}: CustomerTableProps) {
  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Orders</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Spent</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Order</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                      <div className="h-3 w-48 bg-slate-200 rounded animate-pulse" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4"><div className="h-4 w-12 bg-slate-200 rounded animate-pulse" /></td>
                <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded animate-pulse" /></td>
                <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded animate-pulse" /></td>
                <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded animate-pulse" /></td>
                <td className="px-6 py-4"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mx-auto mb-3">
          <ShoppingBag className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-base font-medium text-slate-900 mb-0.5">No customers found</h3>
        <p className="text-xs text-slate-500">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-6 py-4 text-left text-xs uppercase tracking-wider">
              <SortableHeader label="Customer" column="name" currentSort={sortBy} sortOrder={sortOrder} onSort={onSort} />
            </th>
            <th className="px-6 py-4 text-left text-xs uppercase tracking-wider">
              <SortableHeader label="Orders" column="orders" currentSort={sortBy} sortOrder={sortOrder} onSort={onSort} />
            </th>
            <th className="px-6 py-4 text-left text-xs uppercase tracking-wider">
              <SortableHeader label="Total Spent" column="spent" currentSort={sortBy} sortOrder={sortOrder} onSort={onSort} />
            </th>
            <th className="px-6 py-4 text-left text-xs uppercase tracking-wider">
              <SortableHeader label="Last Order" column="lastOrder" currentSort={sortBy} sortOrder={sortOrder} onSort={onSort} />
            </th>
            <th className="px-6 py-4 text-left text-xs uppercase tracking-wider">
              <SortableHeader label="Joined" column="joined" currentSort={sortBy} sortOrder={sortOrder} onSort={onSort} />
            </th>
            <th className="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {customers.map((customer) => {
            const name = getCustomerName(customer);
            const initial = name.charAt(0).toUpperCase();

            return (
              <tr
                key={customer.id}
                onClick={() => onRowClick(customer.id)}
                className="hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-white">{initial}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{name}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-0.5 truncate">
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </span>
                        {customer.phone && (
                          <span className="flex items-center gap-0.5">
                            <Phone className="w-3 h-3" />
                            {customer.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-slate-900">{customer.totalOrders}</span>
                    {customer.totalOrders > 0 && (
                      <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                        Active
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span className={cn(
                    'text-sm font-medium',
                    customer.totalSpent >= 100 ? 'text-emerald-600' : 'text-slate-900'
                  )}>
                    {formatCurrency(customer.totalSpent, customer.currency || 'USD')}
                  </span>
                  {customer.currency && customer.currency !== 'USD' && (
                    <span className="ml-1 text-xs text-slate-500">{customer.currency}</span>
                  )}
                </td>
                <td className="px-6 py-3 text-sm text-slate-600">
                  {customer.lastOrderDate
                    ? formatDistanceToNow(new Date(customer.lastOrderDate), { addSuffix: true })
                    : '—'
                  }
                </td>
                <td className="px-6 py-3 text-sm text-slate-600">
                  {formatDistanceToNow(new Date(customer.createdAt), { addSuffix: true })}
                </td>
                <td className="px-6 py-3">
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
