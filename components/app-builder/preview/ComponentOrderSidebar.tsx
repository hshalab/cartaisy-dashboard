'use client';

import { HomescreenPreviewData } from '@/types';
import {
  Image,
  Grid3X3,
  Megaphone,
  LayoutGrid,
  Layers,
  Tag,
  CircleDot,
  Eye,
  EyeOff,
  GripVertical
} from 'lucide-react';

interface ComponentOrderSidebarProps {
  data: HomescreenPreviewData;
  onScrollTo?: (componentType: string) => void;
}

interface ComponentSection {
  type: string;
  label: string;
  icon: React.ReactNode;
  count: number;
  activeCount: number;
}

export function ComponentOrderSidebar({ data, onScrollTo }: ComponentOrderSidebarProps) {
  const sections: ComponentSection[] = [
    {
      type: 'carousel',
      label: 'Carousel',
      icon: <Image className="w-4 h-4" />,
      count: data.carousel.length,
      activeCount: data.carousel.filter(i => i.isActive).length,
    },
    {
      type: 'categoryGrid',
      label: 'Category Grid',
      icon: <Grid3X3 className="w-4 h-4" />,
      count: data.categoryGrid.length,
      activeCount: data.categoryGrid.filter(i => i.isActive).length,
    },
    {
      type: 'calloutBanners',
      label: 'Callout Banners',
      icon: <Megaphone className="w-4 h-4" />,
      count: data.calloutBanners.length,
      activeCount: data.calloutBanners.filter(i => i.isActive).length,
    },
    {
      type: 'collectionDisplays',
      label: 'Collection Displays',
      icon: <LayoutGrid className="w-4 h-4" />,
      count: data.collectionDisplays.length,
      activeCount: data.collectionDisplays.filter(i => i.isActive).length,
    },
    {
      type: 'categoryCollectionGrids',
      label: 'Category Collections',
      icon: <Layers className="w-4 h-4" />,
      count: data.categoryCollectionGrids.length,
      activeCount: data.categoryCollectionGrids.filter(i => i.isActive).length,
    },
    {
      type: 'promoBanners',
      label: 'Promo Banners',
      icon: <Tag className="w-4 h-4" />,
      count: data.promoBanners.length,
      activeCount: data.promoBanners.filter(i => i.isActive).length,
    },
    {
      type: 'collectionShowcases',
      label: 'Collection Showcases',
      icon: <CircleDot className="w-4 h-4" />,
      count: data.collectionShowcases.length,
      activeCount: data.collectionShowcases.filter(i => i.isActive).length,
    },
  ];

  const totalActive = sections.reduce((sum, s) => sum + s.activeCount, 0);
  const totalComponents = sections.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900">Component Order</h3>
        <p className="text-sm text-slate-600 mt-1">
          {totalActive} of {totalComponents} components active
        </p>
      </div>

      {/* Component List */}
      <div className="p-2">
        {sections.map((section) => (
          <button
            key={section.type}
            onClick={() => onScrollTo?.(section.type)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors text-left group"
          >
            <div className="text-slate-400 group-hover:text-slate-500">
              <GripVertical className="w-4 h-4" />
            </div>

            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              {section.icon}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {section.label}
              </p>
              <p className="text-xs text-slate-500">
                {section.activeCount} active
              </p>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              {section.activeCount > 0 ? (
                <Eye className="w-4 h-4 text-green-500" />
              ) : (
                <EyeOff className="w-4 h-4 text-slate-300" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Last updated</span>
          <span className="text-slate-900 font-medium">
            {new Date(data.metadata.lastUpdated).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}
