'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PromoBannerItem } from '@/types';
import { PromoBannerCard } from './PromoBannerCard';

interface SortablePromoBannerCardProps {
  banner: PromoBannerItem;
  onDelete: () => void;
  onToggleActive: () => void;
}

export function SortablePromoBannerCard({
  banner,
  onDelete,
  onToggleActive,
}: SortablePromoBannerCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: banner.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <PromoBannerCard
        banner={banner}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
