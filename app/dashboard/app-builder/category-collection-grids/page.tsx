'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CategoryCollectionGridItem } from '@/types';
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
import { SortableCategoryCollectionGridCard } from '@/components/app-builder/category-collection-grids/SortableCategoryCollectionGridCard';

export default function CategoryCollectionGridsListPage() {
  const [grids, setGrids] = useState<CategoryCollectionGridItem[]>([]);
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

  const fetchGrids = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/components/category-collection-grids');

      if (!response.ok) {
        throw new Error('Failed to fetch category collection grids');
      }

      const data = await response.json();
      // Transform MongoDB documents to our format
      const transformedData = (data.data || []).map((item: any) => ({
        id: item._id || item.id,
        storeId: item.storeId,
        title: item.title,
        subtitle: item.subtitle,
        collections: item.collections || [],
        position: item.position,
        isActive: item.isActive,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));
      setGrids(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load category collection grids');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrids();
  }, []);

  const handleDelete = () => {
    fetchGrids();
  };

  const handleToggleActive = () => {
    fetchGrids();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = grids.findIndex((g) => g.id === active.id);
      const newIndex = grids.findIndex((g) => g.id === over.id);

      const newItems = arrayMove(grids, oldIndex, newIndex);
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        position: index,
      }));

      setGrids(updatedItems);

      try {
        const items = updatedItems.map((g) => ({
          id: g.id,
          position: g.position,
        }));

        await fetch('/api/components/category-collection-grids/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        });
      } catch (err) {
        console.error('Failed to save order:', err);
        fetchGrids();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Category Collection Grids</h1>
          <p className="text-slate-600 mt-1">Manage your grouped category sections</p>
        </div>
        <Link href="/dashboard/app-builder/category-collection-grids/new">
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
      {!isLoading && grids.length === 0 && !error && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No category collection grids yet
            </h3>
            <p className="text-slate-600 mb-6">
              Create your first category grid to group multiple collections under a section title
            </p>
            <Link href="/dashboard/app-builder/category-collection-grids/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Create First Category Grid
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Grids Grid */}
      {!isLoading && grids.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={grids.map((g) => g.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {grids.map((grid) => (
                <SortableCategoryCollectionGridCard
                  key={grid.id}
                  grid={grid}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Info Card */}
      {!isLoading && grids.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>* Category grids display collections in a 3-column layout</p>
            <p>* Each grid can contain multiple collections with their own images</p>
            <p>* Use section titles like "Shop by Category" or "Browse Collections"</p>
            <p>* Drag grids to reorder them on your app</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
