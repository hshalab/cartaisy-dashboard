'use client';

import { CollectionDisplayItem } from '@/types';

interface CollectionDisplayPreviewProps {
  items: CollectionDisplayItem[];
}

export function CollectionDisplayPreview({ items }: CollectionDisplayPreviewProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      {items.slice(0, 2).map((item) => (
        <div key={item.id} className="px-3">
          {/* Section Title */}
          {item.title && (
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              {item.title}
            </h3>
          )}

          {/* Display based on type */}
          {item.type === 'large_row' && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-shrink-0 w-[140px]">
                  <div className="w-full h-[140px] bg-slate-200 rounded-lg" />
                  <p className="text-[10px] text-slate-700 mt-1 line-clamp-2">Product Name</p>
                  <p className="text-[10px] font-semibold text-slate-900">$99.00</p>
                </div>
              ))}
            </div>
          )}

          {item.type === 'medium_row' && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-shrink-0 w-[100px]">
                  <div className="w-full h-[100px] bg-slate-200 rounded-lg" />
                  <p className="text-[9px] text-slate-700 mt-1 line-clamp-1">Product</p>
                  <p className="text-[9px] font-semibold text-slate-900">$49.00</p>
                </div>
              ))}
            </div>
          )}

          {item.type === 'small_grid' && (
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i}>
                  <div className="w-full aspect-square bg-slate-200 rounded-lg" />
                  <p className="text-[8px] text-slate-700 mt-0.5 line-clamp-1">Item</p>
                  <p className="text-[8px] font-semibold text-slate-900">$29</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
