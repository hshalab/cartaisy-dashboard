'use client';

import { CategoryGridItem } from '@/types';

interface CategoryGridPreviewProps {
  items: CategoryGridItem[];
}

export function CategoryGridPreview({ items }: CategoryGridPreviewProps) {
  if (items.length === 0) return null;

  return (
    <div className="px-3 py-4">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {items.slice(0, 6).map((item) => (
          <div
            key={item.id}
            className="flex-shrink-0 w-[70px] flex flex-col items-center gap-1"
          >
            <div
              className="w-14 h-14 rounded-full bg-cover bg-center border-2 border-slate-200"
              style={{ backgroundImage: `url(${item.imageUrl})` }}
            />
            <span className="text-[10px] text-slate-700 text-center leading-tight line-clamp-2">
              {item.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
