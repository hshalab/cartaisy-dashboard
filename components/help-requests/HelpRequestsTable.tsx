'use client';

import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, HelpCircle, Eye, MessageSquare, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';
import type { HelpRequest, HelpRequestsFilters, HelpRequestsPagination } from '@/types/helpRequests';
import { REASON_LABELS } from '@/types/helpRequests';

interface HelpRequestsTableProps {
  helpRequests: HelpRequest[];
  pagination: HelpRequestsPagination;
  filters: HelpRequestsFilters;
  onFiltersChange: (filters: HelpRequestsFilters) => void;
  onRowClick: (helpRequest: HelpRequest) => void;
  isLoading?: boolean;
}

export function HelpRequestsTable({
  helpRequests,
  pagination,
  filters,
  onFiltersChange,
  onRowClick,
  isLoading = false,
}: HelpRequestsTableProps) {
  const handleSort = (sortBy: 'createdAt' | 'status') => {
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
    column: 'createdAt' | 'status';
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

  if (isLoading && helpRequests.length === 0) {
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

  if (helpRequests.length === 0) {
    const isFiltered = filters.status && filters.status !== 'open';
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-1">
          {isFiltered ? 'No help requests match your filters' : 'All caught up!'}
        </h3>
        <p className="text-slate-500 text-sm">
          {isFiltered
            ? 'Try adjusting your filters or check back later.'
            : 'No open help requests. Great job!'}
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
                Request ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Order #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Reason
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <SortButton column="status">Status</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <SortButton column="createdAt">Date</SortButton>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {helpRequests.map((request) => (
              <tr
                key={request.id}
                onClick={() => onRowClick(request)}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3">
                  <span className="font-mono text-sm text-slate-600">
                    {request.id.length > 15 ? `${request.id.slice(0, 15)}...` : request.id}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-blue-600">
                    {request.orderNumber}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-slate-600">{request.customerEmail}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-slate-700">
                      {REASON_LABELS[request.reason] || request.reasonLabel}
                    </span>
                    {request.reason === 'other' && request.otherText && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-sm">{request.otherText}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={request.status} />
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {format(new Date(request.createdAt), 'MMM d, yyyy')}
                  <br />
                  <span className="text-xs text-slate-400">
                    {format(new Date(request.createdAt), 'h:mm a')}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick(request);
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
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <p className="text-sm text-slate-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} requests
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
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages || isLoading}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
