'use client';

import { CalloutBannerItem } from '@/types';

interface CalloutBannersPreviewProps {
  items: CalloutBannerItem[];
}

export function CalloutBannersPreview({ items }: CalloutBannersPreviewProps) {
  if (items.length === 0) return null;

  return (
    <div className="px-3 py-2 space-y-2">
      {items.slice(0, 2).map((item) => (
        <div
          key={item.id}
          className="relative rounded-lg overflow-hidden"
          style={{ backgroundColor: item.backgroundColor || '#f8fafc' }}
        >
          <div className="flex items-center p-3 gap-3">
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4
                className="text-sm font-bold leading-tight"
                style={{ color: item.textColor || '#1e293b' }}
              >
                {item.title}
              </h4>
              {item.subTitle && (
                <p
                  className="text-[10px] mt-0.5 line-clamp-2"
                  style={{ color: item.textColor ? `${item.textColor}cc` : '#64748b' }}
                >
                  {item.subTitle}
                </p>
              )}
              {item.buttonText && (
                <button
                  className="mt-1.5 px-2 py-0.5 text-[9px] font-semibold rounded text-white"
                  style={{ backgroundColor: item.buttonColor || '#2563eb' }}
                >
                  {item.buttonText}
                </button>
              )}
            </div>

            {/* Image */}
            {item.imageUrl && (
              <div
                className="w-16 h-16 rounded-lg bg-cover bg-center flex-shrink-0"
                style={{ backgroundImage: `url(${item.imageUrl})` }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
