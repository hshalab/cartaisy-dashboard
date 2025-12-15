'use client';

import { HistoryFilters as FilterType } from '@/lib/api/notifications';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Filter, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HistoryFiltersProps {
  filters: FilterType;
  onFilterChange: (filters: FilterType) => void;
}

export function HistoryFilters({ filters, onFilterChange }: HistoryFiltersProps) {
  const handleChange = (key: keyof FilterType, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value || undefined,
      page: 1,
    });
  };

  const hasFilters = filters.status || filters.segment || filters.startDate || filters.endDate;

  const clearFilters = () => {
    onFilterChange({ page: 1, limit: filters.limit });
  };

  const activeFilterCount = [filters.status, filters.segment, filters.startDate, filters.endDate].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
        <Filter className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-700">Filters</span>
        {activeFilterCount > 0 && (
          <span className="px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
            {activeFilterCount} active
          </span>
        )}
      </div>

      <div className="p-4 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5 min-w-[140px]">
          <Label className="text-xs font-medium text-slate-500">Status</Label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => handleChange('status', value === 'all' ? '' : value)}
          >
            <SelectTrigger className="h-10 bg-slate-50 border-slate-200 hover:bg-white transition-colors">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="sent">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Sent
                </span>
              </SelectItem>
              <SelectItem value="partial">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Partial
                </span>
              </SelectItem>
              <SelectItem value="failed">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Failed
                </span>
              </SelectItem>
              <SelectItem value="scheduled">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Scheduled
                </span>
              </SelectItem>
              <SelectItem value="sending">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  Sending
                </span>
              </SelectItem>
              <SelectItem value="draft">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Draft
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5 min-w-[160px]">
          <Label className="text-xs font-medium text-slate-500">Segment</Label>
          <Select
            value={filters.segment || 'all'}
            onValueChange={(value) => handleChange('segment', value === 'all' ? '' : value)}
          >
            <SelectTrigger className="h-10 bg-slate-50 border-slate-200 hover:bg-white transition-colors">
              <SelectValue placeholder="All Segments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Segments</SelectItem>
              <SelectItem value="all_customers">All Customers</SelectItem>
              <SelectItem value="inactive_30">Inactive (30 days)</SelectItem>
              <SelectItem value="inactive_60">Inactive (60 days)</SelectItem>
              <SelectItem value="repeat_customers">Repeat Customers</SelectItem>
              <SelectItem value="new_customers">New Customers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            From
          </Label>
          <Input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="h-10 w-[150px] bg-slate-50 border-slate-200 hover:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            To
          </Label>
          <Input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="h-10 w-[150px] bg-slate-50 border-slate-200 hover:bg-white transition-colors"
          />
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-10 text-slate-500 hover:text-red-600 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
}
