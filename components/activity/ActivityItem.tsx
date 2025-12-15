'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Activity } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItemProps {
  activity: Activity;
}

const actionConfig: Record<
  string,
  { icon: typeof Plus; color: string; bgColor: string; label: string }
> = {
  create: {
    icon: Plus,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Created',
  },
  update: {
    icon: Pencil,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Updated',
  },
  delete: {
    icon: Trash2,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Deleted',
  },
  activate: {
    icon: Check,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Activated',
  },
  deactivate: {
    icon: X,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    label: 'Deactivated',
  },
};

const resourceTypeLabels: Record<string, string> = {
  carousel: 'Carousel',
  category_grid: 'Category Grid',
  callout_banner: 'Callout Banner',
  collection_display: 'Collection Display',
  promo_banner: 'Promo Banner',
  category_collection_grid: 'Category Collection Grid',
  collection_showcase: 'Collection Showcase',
  store_settings: 'Store Settings',
  team_member: 'Team Member',
  shopify_connection: 'Shopify Connection',
};

const resourceTypeUrls: Record<string, string> = {
  carousel: '/dashboard/app-builder/carousel',
  category_grid: '/dashboard/app-builder/category-grid',
  callout_banner: '/dashboard/app-builder/callout-banners',
  collection_display: '/dashboard/app-builder/collection-displays',
  promo_banner: '/dashboard/app-builder/promo-banners',
  category_collection_grid: '/dashboard/app-builder/category-collection-grid',
  collection_showcase: '/dashboard/app-builder/collection-showcases',
  store_settings: '/dashboard/settings',
  team_member: '/dashboard/team',
};

export function ActivityItem({ activity }: ActivityItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const config = actionConfig[activity.action] || actionConfig.update;
  const Icon = config.icon;
  const resourceLabel = resourceTypeLabels[activity.resourceType] || activity.resourceType;
  const resourceUrl = resourceTypeUrls[activity.resourceType];

  const hasChanges =
    activity.changes &&
    (Object.keys(activity.changes.before || {}).length > 0 ||
      Object.keys(activity.changes.after || {}).length > 0);

  const timeAgo = formatDistanceToNow(new Date(activity.createdAt), {
    addSuffix: true,
  });

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-4">
        {/* Action Icon */}
        <div className={cn('p-2 rounded-full', config.bgColor)}>
          <Icon className={cn('w-4 h-4', config.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* User and Action */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <span className="font-medium text-slate-900">
                {activity.user.name || activity.user.email}
              </span>
            </div>

            <span className={cn('text-sm font-medium', config.color)}>
              {config.label.toLowerCase()}
            </span>

            <span className="text-sm text-slate-600">
              {activity.resourceName ? (
                <>
                  <span className="text-slate-400">·</span>{' '}
                  <span className="font-medium text-slate-900">
                    {activity.resourceName}
                  </span>
                </>
              ) : null}
            </span>
          </div>

          {/* Resource Type Badge and Timestamp */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
              {resourceLabel}
            </span>

            <span className="text-xs text-slate-500">{timeAgo}</span>

            {resourceUrl && activity.action !== 'delete' && (
              <Link
                href={`${resourceUrl}/${activity.resourceId}/edit`}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>

          {/* Expandable Changes */}
          {hasChanges && (
            <div className="mt-3">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 transition-colors"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    Hide changes
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    Show changes
                  </>
                )}
              </button>

              {isExpanded && (
                <div className="mt-2 p-3 bg-slate-50 rounded-lg text-xs font-mono space-y-2">
                  {activity.changes?.before &&
                    Object.keys(activity.changes.before).length > 0 && (
                      <div>
                        <span className="text-red-600 font-semibold">- Before:</span>
                        <pre className="mt-1 text-slate-600 whitespace-pre-wrap break-words">
                          {JSON.stringify(activity.changes.before, null, 2)}
                        </pre>
                      </div>
                    )}
                  {activity.changes?.after &&
                    Object.keys(activity.changes.after).length > 0 && (
                      <div>
                        <span className="text-green-600 font-semibold">+ After:</span>
                        <pre className="mt-1 text-slate-600 whitespace-pre-wrap break-words">
                          {JSON.stringify(activity.changes.after, null, 2)}
                        </pre>
                      </div>
                    )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
