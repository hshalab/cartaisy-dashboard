'use client';

import { useState } from 'react';
import { Search, X, RefreshCw, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { HelpRequestsFilters, HelpRequestStatus } from '@/types/helpRequests';

interface FiltersBarProps {
  filters: HelpRequestsFilters;
  onFiltersChange: (filters: HelpRequestsFilters) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function FiltersBar({
  filters,
  onFiltersChange,
  onRefresh,
  isLoading = false,
}: FiltersBarProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: searchValue, page: 1 });
  };

  const handleFilterChange = (key: keyof HelpRequestsFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 });
  };

  const handleClearFilters = () => {
    setSearchValue('');
    onFiltersChange({
      page: 1,
      limit: filters.limit,
      status: 'open',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters =
    filters.search ||
    (filters.status && filters.status !== 'open');

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by order # or email..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </form>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-2">
          {/* Status Filter */}
          <Select
            value={filters.status || 'open'}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select
            value={`${filters.sortBy || 'createdAt'}-${filters.sortOrder || 'desc'}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split('-') as ['createdAt' | 'status', 'asc' | 'desc'];
              onFiltersChange({ ...filters, sortBy, sortOrder, page: 1 });
            }}
          >
            <SelectTrigger className="w-[160px] h-9 text-sm">
              <ArrowUpDown className="w-3.5 h-3.5 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">Newest First</SelectItem>
              <SelectItem value="createdAt-asc">Oldest First</SelectItem>
              <SelectItem value="status-asc">Status (A-Z)</SelectItem>
              <SelectItem value="status-desc">Status (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-slate-600 h-8"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Clear filters
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}
