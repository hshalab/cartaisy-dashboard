'use client';

import { ActivityStats } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, User, LayoutGrid, Clock } from 'lucide-react';

interface ActivityStatsCardsProps {
  stats: ActivityStats;
  isLoading?: boolean;
}

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

export function ActivityStatsCards({ stats, isLoading }: ActivityStatsCardsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-slate-200 rounded w-24 mb-2" />
              <div className="h-8 bg-slate-200 rounded w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Changes (7 Days)',
      value: stats.totalChanges7Days,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Changes (24 Hours)',
      value: stats.totalChanges24Hours,
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Most Active User',
      value: stats.mostActiveUser
        ? `${stats.mostActiveUser.name || stats.mostActiveUser.email.split('@')[0]} (${stats.mostActiveUser.count})`
        : 'N/A',
      icon: User,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      isText: true,
    },
    {
      title: 'Most Edited Type',
      value: stats.mostEditedType
        ? `${resourceTypeLabels[stats.mostEditedType.resourceType] || stats.mostEditedType.resourceType} (${stats.mostEditedType.count})`
        : 'N/A',
      icon: LayoutGrid,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      isText: true,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-sm text-slate-600">{card.title}</p>
                  <p
                    className={`font-bold ${
                      card.isText ? 'text-sm text-slate-900' : 'text-2xl text-slate-900'
                    }`}
                  >
                    {card.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
