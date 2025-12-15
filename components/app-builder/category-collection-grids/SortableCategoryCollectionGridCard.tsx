'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CategoryCollectionGridItem } from '@/types';
import { CategoryCollectionGridCard } from './CategoryCollectionGridCard';

interface SortableCategoryCollectionGridCardProps {
  grid: CategoryCollectionGridItem;
  onDelete: () => void;
  onToggleActive: () => void;
}

export function SortableCategoryCollectionGridCard({
  grid,
  onDelete,
  onToggleActive,
}: SortableCategoryCollectionGridCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: grid.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <CategoryCollectionGridCard
        grid={grid}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
