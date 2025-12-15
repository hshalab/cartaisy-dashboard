'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/lib/auth';
import { Activity, ActivityStats } from '@/types';
import {
  ActivityItem,
  ActivityStatsCards,
  ActivityFilters,
  FilterValues,
} from '@/components/activity';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  Loader2,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Sparkles,
  History,
  Filter,
  FileText,
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
}

const ITEMS_PER_PAGE = 20;

export default function ActivityPage() {
  const { data: session } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<FilterValues>({});

  const isSuperAdmin = session?.user?.role === 'super_admin';

  const fetchActivities = useCallback(
    async (currentFilters: FilterValues, currentOffset: number) => {
      try {
        setIsLoading(true);
        setError('');

        const params = new URLSearchParams();
        params.set('limit', String(ITEMS_PER_PAGE));
        params.set('offset', String(currentOffset));

        if (currentFilters.userId) params.set('userId', currentFilters.userId);
        if (currentFilters.action) params.set('action', currentFilters.action);
        if (currentFilters.resourceType)
          params.set('resourceType', currentFilters.resourceType);
        if (currentFilters.startDate) params.set('startDate', currentFilters.startDate);
        if (currentFilters.endDate) params.set('endDate', currentFilters.endDate);
        if (currentFilters.search) params.set('search', currentFilters.search);

        if (isSuperAdmin && teamMembers.length === 0) {
          params.set('includeTeamMembers', 'true');
        }

        const response = await fetch(`/api/activity?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }

        const data = await response.json();
        setActivities(data.data.activities);
        setTotal(data.data.total);

        if (data.data.teamMembers) {
          setTeamMembers(data.data.teamMembers);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load activities');
      } finally {
        setIsLoading(false);
      }
    },
    [isSuperAdmin, teamMembers.length]
  );

  const fetchStats = useCallback(async () => {
    if (!isSuperAdmin) {
      setIsLoadingStats(false);
      return;
    }

    try {
      setIsLoadingStats(true);
      const response = await fetch('/api/activity/stats');

      if (!response.ok) {
        setIsLoadingStats(false);
        return;
      }

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    fetchActivities(filters, offset);
    fetchStats();
  }, [fetchActivities, fetchStats, filters, offset]);

  const handleApplyFilters = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setOffset(0);
  };

  const handleResetFilters = () => {
    setFilters({});
    setOffset(0);
  };

  const handlePrevPage = () => {
    setOffset(Math.max(0, offset - ITEMS_PER_PAGE));
  };

  const handleNextPage = () => {
    if (offset + ITEMS_PER_PAGE < total) {
      setOffset(offset + ITEMS_PER_PAGE);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Resource Type', 'Resource Name'];
    const rows = activities.map((a) => [
      new Date(a.createdAt).toISOString(),
      a.user.name || a.user.email,
      a.action,
      a.resourceType,
      a.resourceName || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const currentPage = Math.floor(offset / ITEMS_PER_PAGE) + 1;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const hasActiveFilters = Object.keys(filters).some((k) => filters[k as keyof FilterValues]);

  if (isLoading && activities.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-600">Loading activity log...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-blue-400 text-sm font-medium mb-2">
                <History className="w-4 h-4" />
                <span>Activity Log</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {isSuperAdmin ? 'Team Activity' : 'Your Activity'}
              </h1>
              <p className="text-slate-400 text-lg max-w-xl">
                {isSuperAdmin
                  ? 'Track all changes made by team members to components and settings.'
                  : 'View your recent activity and changes.'}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-2">
                  <ClipboardList className="w-7 h-7 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-white">{total}</p>
                <p className="text-sm text-slate-400">Total Events</p>
              </div>
              {isSuperAdmin && stats && (
                <>
                  <div className="w-px bg-white/10" />
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-2">
                      <FileText className="w-7 h-7 text-cyan-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.totalChanges24Hours || 0}</p>
                    <p className="text-sm text-slate-400">Last 24h</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards (Super Admin only) */}
      {isSuperAdmin && stats && (
        <ActivityStatsCards stats={stats} isLoading={isLoadingStats} />
      )}

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-600">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">
              {hasActiveFilters ? 'Filters active' : 'No filters'}
            </span>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-slate-500 hover:text-slate-700"
            >
              Clear all
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {activities.length > 0 && (
            <Button variant="outline" onClick={handleExportCSV} className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Filters</h3>
          </div>
        </div>
        <div className="p-4">
          <ActivityFilters
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
            teamMembers={teamMembers}
            isSuperAdmin={isSuperAdmin}
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && activities.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && activities.length === 0 && !error && (
        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12">
          <div className="flex flex-col items-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <ClipboardList className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No activity found</h3>
            <p className="text-slate-500 mb-4">
              {hasActiveFilters
                ? 'Try adjusting your filters to see more results.'
                : 'Activity will appear here as changes are made.'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleResetFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Activity List */}
      {!isLoading && activities.length > 0 && (
        <>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Activity Timeline</h2>
            </div>
            <div className="space-y-3">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200">
            <p className="text-sm text-slate-600">
              Showing <span className="font-medium">{offset + 1}</span> to{' '}
              <span className="font-medium">{Math.min(offset + ITEMS_PER_PAGE, total)}</span> of{' '}
              <span className="font-medium">{total}</span> results
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={offset === 0}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-sm font-medium text-slate-700">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={offset + ITEMS_PER_PAGE >= total}
                className="gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Pro Tips */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-1">Activity Tracking</h3>
            <p className="text-sm text-slate-600">
              All changes to your app components, settings, and team are automatically logged.
              Use filters to find specific events or export to CSV for detailed analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
