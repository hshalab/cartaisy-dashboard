'use client';

import { CollectionShowcaseItem } from '@/types';

interface CollectionShowcasePreviewProps {
  items: CollectionShowcaseItem[];
}

export function CollectionShowcasePreview({ items }: CollectionShowcasePreviewProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-4 py-2">
      {items.slice(0, 1).map((item) => (
        <div key={item.id} className="px-3">
          {/* Section Header */}
          <div className="flex items-center gap-2 mb-2">
            {item.icon && (
              <span className="text-base">{item.icon}</span>
            )}
            <h3 className="text-sm font-bold text-slate-900">
              {item.title}
            </h3>
          </div>

          {/* Grid Layout */}
          {item.type === 'grid' && (
            <div className="grid grid-cols-2 gap-2">
              {item.collections.slice(0, 4).map((collection, index) => (
                <div
                  key={index}
                  className="relative rounded-lg overflow-hidden"
                >
                  <div
                    className="w-full aspect-[4/3] bg-cover bg-center bg-slate-200"
                    style={{
                      backgroundImage: collection.image ? `url(${collection.image})` : undefined
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-1.5 left-2 text-[10px] font-medium text-white">
                    {collection.title}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Circular Layout */}
          {item.type === 'circular' && (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {item.collections.slice(0, 5).map((collection, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-14 h-14 rounded-full bg-cover bg-center bg-slate-200 border-2 border-slate-100 shadow-sm"
                    style={{
                      backgroundImage: collection.image ? `url(${collection.image})` : undefined
                    }}
                  />
                  <span className="text-[9px] text-slate-700 text-center max-w-[60px] line-clamp-2">
                    {collection.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
