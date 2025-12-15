'use client';

import { CarouselItem } from '@/types';

interface CarouselPreviewProps {
  items: CarouselItem[];
}

export function CarouselPreview({ items }: CarouselPreviewProps) {
  if (items.length === 0) return null;

  const activeItem = items[0]; // Show first item as active

  return (
    <div className="relative w-full h-[200px] overflow-hidden">
      {/* Main Carousel Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${activeItem.imageUrl})` }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* Promo Tag */}
      {activeItem.promoTag && (
        <div
          className="absolute top-3 left-3 px-2 py-1 rounded text-[10px] font-semibold"
          style={{
            backgroundColor: activeItem.promoTag.backgroundColor || '#ef4444',
            color: activeItem.promoTag.textColor || '#ffffff'
          }}
        >
          {activeItem.promoTag.text}
        </div>
      )}

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        {activeItem.label && (
          <span className="text-[10px] font-medium uppercase tracking-wider opacity-80">
            {activeItem.label}
          </span>
        )}
        <h3 className="text-lg font-bold leading-tight mt-1">
          {activeItem.title}
        </h3>
        {activeItem.subtitle && (
          <p className="text-xs opacity-90 mt-1 line-clamp-2">
            {activeItem.subtitle}
          </p>
        )}
        {activeItem.ctaText && (
          <button className="mt-2 px-3 py-1 bg-white text-black text-[10px] font-semibold rounded">
            {activeItem.ctaText}
          </button>
        )}
      </div>

      {/* Pagination Dots */}
      {items.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {items.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full ${
                index === 0 ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
