'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CollectionShowcaseItem } from '@/types';
import { CollectionShowcaseCard } from './CollectionShowcaseCard';

interface SortableCollectionShowcaseCardProps {
  showcase: CollectionShowcaseItem;
  onDelete: () => void;
  onToggleActive: () => void;
}

export function SortableCollectionShowcaseCard({
  showcase,
  onDelete,
  onToggleActive,
}: SortableCollectionShowcaseCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: showcase.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <CollectionShowcaseCard
        showcase={showcase}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
