'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalloutBannerItem } from '@/types';
import { CalloutBannerCard } from './CalloutBannerCard';

interface SortableCalloutBannerCardProps {
  banner: CalloutBannerItem;
  onDelete: () => void;
  onToggleActive: () => void;
}

export function SortableCalloutBannerCard({
  banner,
  onDelete,
  onToggleActive,
}: SortableCalloutBannerCardProps) {
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
      <CalloutBannerCard
        banner={banner}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
