'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CategoryGridItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Plus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableCategoryGridCard } from '@/components/app-builder/category-grid/SortableCategoryGridCard';

export default function CategoryGridListPage() {
  const [categoryGrids, setCategoryGrids] = useState<CategoryGridItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchCategoryGrids = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/components/category-grid');

      if (!response.ok) {
        throw new Error('Failed to fetch category grid items');
      }

      const data = await response.json();
      setCategoryGrids(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load category grid items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryGrids();
  }, []);

  const handleDelete = () => {
    fetchCategoryGrids();
  };

  const handleToggleActive = () => {
    fetchCategoryGrids();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categoryGrids.findIndex((c) => c.id === active.id);
      const newIndex = categoryGrids.findIndex((c) => c.id === over.id);

      const newItems = arrayMove(categoryGrids, oldIndex, newIndex);
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        position: index,
      }));

      setCategoryGrids(updatedItems);

      try {
        const items = updatedItems.map((c) => ({
          id: c.id,
          position: c.position,
        }));

        await fetch('/api/components/category-grid/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        });
      } catch (err) {
        console.error('Failed to save order:', err);
        fetchCategoryGrids();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Category Grid</h1>
          <p className="text-slate-600 mt-1">Manage your category grid items</p>
        </div>
        <Link href="/dashboard/app-builder/category-grid/new">
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Plus className="w-4 h-4" />
            Add New
          </Button>
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && categoryGrids.length === 0 && !error && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No category grid items yet
            </h3>
            <p className="text-slate-600 mb-6">
              Create your first category grid item to showcase your product categories
            </p>
            <Link href="/dashboard/app-builder/category-grid/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Create First Category
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Category Grid */}
      {!isLoading && categoryGrids.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categoryGrids.map((c) => c.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {categoryGrids.map((categoryGrid) => (
                <SortableCategoryGridCard
                  key={categoryGrid.id}
                  categoryGrid={categoryGrid}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Info Card */}
      {!isLoading && categoryGrids.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>✓ Drag category items to reorder them</p>
            <p>✓ Toggle active/inactive to show/hide items</p>
            <p>✓ Each category links to a Shopify collection</p>
            <p>✓ Display up to 4 categories in a row</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
