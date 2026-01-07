'use client';

import { useState, useEffect, useCallback } from 'react';
import { HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { helpRequestsApi, HelpRequestsListResponse } from '@/lib/api/helpRequests';
import { StatsCards } from '@/components/help-requests/StatsCards';
import { FiltersBar } from '@/components/help-requests/FiltersBar';
import { HelpRequestsTable } from '@/components/help-requests/HelpRequestsTable';
import { HelpRequestDetail } from '@/components/help-requests/HelpRequestDetail';
import type {
  HelpRequest,
  HelpRequestsFilters,
  HelpRequestsStatusCounts,
  HelpRequestsPagination,
  HelpRequestStatus,
  UpdateHelpRequestPayload,
} from '@/types/helpRequests';

export default function HelpRequestsPage() {
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [statusCounts, setStatusCounts] = useState<HelpRequestsStatusCounts>({
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  });
  const [pagination, setPagination] = useState<HelpRequestsPagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState<HelpRequestsFilters>({
    page: 1,
    limit: 20,
    status: 'open',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail modal state
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchHelpRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: HelpRequestsListResponse = await helpRequestsApi.getHelpRequests(filters);
      setHelpRequests(response.helpRequests);
      setPagination(response.pagination);
      setStatusCounts(response.statusCounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load help requests');
      toast.error('Failed to load help requests');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchHelpRequests();
  }, [fetchHelpRequests]);

  const handleFiltersChange = (newFilters: HelpRequestsFilters) => {
    setFilters(newFilters);
  };

  const handleStatusCardClick = (status: HelpRequestStatus | 'all') => {
    setFilters((prev) => ({
      ...prev,
      status,
      page: 1,
    }));
  };

  const handleRefresh = () => {
    fetchHelpRequests();
  };

  const handleRowClick = (helpRequest: HelpRequest) => {
    setSelectedRequest(helpRequest);
    setIsDetailOpen(true);
  };

  const handleDetailClose = () => {
    setIsDetailOpen(false);
    setSelectedRequest(null);
  };

  const handleSaveRequest = async (payload: UpdateHelpRequestPayload) => {
    if (!selectedRequest) return;

    try {
      setIsSaving(true);
      await helpRequestsApi.updateHelpRequest(
        selectedRequest.orderId,
        selectedRequest.id,
        payload
      );
      toast.success('Help request updated successfully');
      handleDetailClose();
      fetchHelpRequests();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update help request');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Help Requests</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and respond to customer help requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards
        statusCounts={statusCounts}
        isLoading={isLoading}
        selectedStatus={filters.status as HelpRequestStatus | 'all'}
        onStatusClick={handleStatusCardClick}
      />

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <FiltersBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={handleRefresh}
              className="text-sm font-medium text-red-700 hover:text-red-900 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Help Requests Table */}
      <HelpRequestsTable
        helpRequests={helpRequests}
        pagination={pagination}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onRowClick={handleRowClick}
        isLoading={isLoading}
      />

      {/* Help Request Detail Modal */}
      <HelpRequestDetail
        helpRequest={selectedRequest}
        isOpen={isDetailOpen}
        onClose={handleDetailClose}
        onSave={handleSaveRequest}
        isSaving={isSaving}
      />
    </div>
  );
}
