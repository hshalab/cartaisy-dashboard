'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CarouselItem } from '@/types';
import { CarouselCard } from './CarouselCard';

interface SortableCarouselCardProps {
  carousel: CarouselItem;
  onDelete: () => void;
  onToggleActive: () => void;
}

export function SortableCarouselCard({
  carousel,
  onDelete,
  onToggleActive,
}: SortableCarouselCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: carousel.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <CarouselCard
        carousel={carousel}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
