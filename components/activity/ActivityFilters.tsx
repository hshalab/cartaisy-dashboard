'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, X, Search } from 'lucide-react';
import { ActivityAction, ActivityResourceType } from '@/types';

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
}

interface ActivityFiltersProps {
  onApply: (filters: FilterValues) => void;
  onReset: () => void;
  teamMembers?: TeamMember[];
  isSuperAdmin: boolean;
}

export interface FilterValues {
  userId?: string;
  action?: ActivityAction;
  resourceType?: ActivityResourceType;
  startDate?: string;
  endDate?: string;
  search?: string;
}

const actionOptions: { value: ActivityAction; label: string }[] = [
  { value: 'create', label: 'Created' },
  { value: 'update', label: 'Updated' },
  { value: 'delete', label: 'Deleted' },
  { value: 'activate', label: 'Activated' },
  { value: 'deactivate', label: 'Deactivated' },
];

const resourceTypeOptions: { value: ActivityResourceType; label: string }[] = [
  { value: 'carousel', label: 'Carousel' },
  { value: 'category_grid', label: 'Category Grid' },
  { value: 'callout_banner', label: 'Callout Banner' },
  { value: 'collection_display', label: 'Collection Display' },
  { value: 'promo_banner', label: 'Promo Banner' },
  { value: 'category_collection_grid', label: 'Category Collection Grid' },
  { value: 'collection_showcase', label: 'Collection Showcase' },
  { value: 'store_settings', label: 'Store Settings' },
  { value: 'team_member', label: 'Team Member' },
  { value: 'shopify_connection', label: 'Shopify Connection' },
];

const datePresets = [
  { label: 'Last 24 hours', days: 1 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

export function ActivityFilters({
  onApply,
  onReset,
  teamMembers = [],
  isSuperAdmin,
}: ActivityFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({});

  const handleApply = () => {
    onApply(filters);
  };

  const handleReset = () => {
    setFilters({});
    onReset();
  };

  const handleDatePreset = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    setFilters({
      ...filters,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
            {hasActiveFilters && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide' : 'Show'}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search by name</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="search"
                placeholder="Search resource name..."
                value={filters.search || ''}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="pl-9"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date range</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {datePresets.map((preset) => (
                <Button
                  key={preset.days}
                  variant="outline"
                  size="sm"
                  onClick={() => handleDatePreset(preset.days)}
                  className="text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="startDate" className="text-xs text-slate-500">
                  From
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-xs text-slate-500">
                  To
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* User Filter (Super Admin only) */}
            {isSuperAdmin && teamMembers.length > 0 && (
              <div className="space-y-2">
                <Label>User</Label>
                <Select
                  value={filters.userId || 'all'}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      userId: value === 'all' ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All users</SelectItem>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name || member.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Action Filter */}
            <div className="space-y-2">
              <Label>Action</Label>
              <Select
                value={filters.action || 'all'}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    action: value === 'all' ? undefined : (value as ActivityAction),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  {actionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Resource Type Filter */}
            <div className="space-y-2">
              <Label>Resource type</Label>
              <Select
                value={filters.resourceType || 'all'}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    resourceType:
                      value === 'all' ? undefined : (value as ActivityResourceType),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {resourceTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleApply} className="bg-blue-600 hover:bg-blue-700">
              Apply Filters
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <X className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
