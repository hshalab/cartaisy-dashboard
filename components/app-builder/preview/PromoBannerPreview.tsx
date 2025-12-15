'use client';

import { PromoBannerItem } from '@/types';

interface PromoBannerPreviewProps {
  items: PromoBannerItem[];
}

export function PromoBannerPreview({ items }: PromoBannerPreviewProps) {
  if (items.length === 0) return null;

  return (
    <div className="px-3 py-2 space-y-3">
      {items.slice(0, 1).map((item) => (
        <div
          key={item.id}
          className="rounded-xl overflow-hidden shadow-sm"
          style={{ backgroundColor: item.backgroundColor || '#1e293b' }}
        >
          <div className="flex items-center">
            {/* Content Side */}
            <div className="flex-1 p-4">
              <h3
                className="text-sm font-bold leading-tight"
                style={{ color: item.textColor || '#ffffff' }}
              >
                {item.title}
              </h3>
              {item.subtitle && (
                <p
                  className="text-[10px] mt-1 line-clamp-2 opacity-90"
                  style={{ color: item.textColor || '#ffffff' }}
                >
                  {item.subtitle}
                </p>
              )}
              {item.ctaText && (
                <button
                  className="mt-2 px-3 py-1 text-[10px] font-semibold rounded-full"
                  style={{
                    backgroundColor: item.buttonColor || '#ffffff',
                    color: item.backgroundColor || '#1e293b'
                  }}
                >
                  {item.ctaText}
                </button>
              )}
            </div>

            {/* Image Side */}
            {item.image && (
              <div
                className="w-[120px] h-[100px] bg-cover bg-center"
                style={{ backgroundImage: `url(${item.image})` }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
