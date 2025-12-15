'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CollectionDisplayItem } from '@/types';
import { CollectionDisplayCard } from './CollectionDisplayCard';

interface SortableCollectionDisplayCardProps {
  display: CollectionDisplayItem;
  onDelete: () => void;
  onToggleActive: () => void;
}

export function SortableCollectionDisplayCard({
  display,
  onDelete,
  onToggleActive,
}: SortableCollectionDisplayCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: display.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <CollectionDisplayCard
        display={display}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
