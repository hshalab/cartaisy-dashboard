'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CategoryGridItem } from '@/types';
import { CategoryGridCard } from './CategoryGridCard';

interface SortableCategoryGridCardProps {
  categoryGrid: CategoryGridItem;
  onDelete: () => void;
  onToggleActive: () => void;
}

export function SortableCategoryGridCard({
  categoryGrid,
  onDelete,
  onToggleActive,
}: SortableCategoryGridCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: categoryGrid.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <CategoryGridCard
        categoryGrid={categoryGrid}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
