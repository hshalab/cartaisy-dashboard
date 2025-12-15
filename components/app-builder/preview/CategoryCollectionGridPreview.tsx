'use client';

import { CategoryCollectionGridItem } from '@/types';

interface CategoryCollectionGridPreviewProps {
  items: CategoryCollectionGridItem[];
}

export function CategoryCollectionGridPreview({ items }: CategoryCollectionGridPreviewProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-4 py-2">
      {items.slice(0, 1).map((item) => (
        <div key={item.id} className="px-3">
          {/* Section Header */}
          <div className="mb-2">
            <h3 className="text-sm font-bold text-slate-900">
              {item.title}
            </h3>
            {item.subtitle && (
              <p className="text-[10px] text-slate-600">
                {item.subtitle}
              </p>
            )}
          </div>

          {/* 3-Column Grid */}
          <div className="grid grid-cols-3 gap-2">
            {item.collections.slice(0, 6).map((collection, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="w-full aspect-square rounded-lg bg-cover bg-center bg-slate-200"
                  style={{
                    backgroundImage: collection.image ? `url(${collection.image})` : undefined
                  }}
                />
                <span className="text-[9px] text-slate-700 text-center mt-1 line-clamp-2">
                  {collection.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
