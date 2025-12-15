'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CollectionShowcaseItem } from '@/types';
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
import { SortableCollectionShowcaseCard } from '@/components/app-builder/collection-showcases/SortableCollectionShowcaseCard';

export default function CollectionShowcasesListPage() {
  const [showcases, setShowcases] = useState<CollectionShowcaseItem[]>([]);
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

  const fetchShowcases = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/components/collection-showcases');

      if (!response.ok) {
        throw new Error('Failed to fetch collection showcases');
      }

      const data = await response.json();
      // Transform MongoDB documents to our format
      const transformedData = (data.data || []).map((item: any) => ({
        id: item._id || item.id,
        storeId: item.storeId,
        type: item.type,
        title: item.title,
        icon: item.icon,
        collections: item.collections || [],
        position: item.position,
        isActive: item.isActive,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));
      setShowcases(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collection showcases');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShowcases();
  }, []);

  const handleDelete = () => {
    fetchShowcases();
  };

  const handleToggleActive = () => {
    fetchShowcases();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = showcases.findIndex((s) => s.id === active.id);
      const newIndex = showcases.findIndex((s) => s.id === over.id);

      const newItems = arrayMove(showcases, oldIndex, newIndex);
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        position: index,
      }));

      setShowcases(updatedItems);

      try {
        const items = updatedItems.map((s) => ({
          id: s.id,
          position: s.position,
        }));

        await fetch('/api/components/collection-showcases/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        });
      } catch (err) {
        console.error('Failed to save order:', err);
        fetchShowcases();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Collection Showcases</h1>
          <p className="text-slate-600 mt-1">Manage your collection display sections</p>
        </div>
        <Link href="/dashboard/app-builder/collection-showcases/new">
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
      {!isLoading && showcases.length === 0 && !error && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No collection showcases yet
            </h3>
            <p className="text-slate-600 mb-6">
              Create your first collection showcase to display collections in a grid or circular layout
            </p>
            <Link href="/dashboard/app-builder/collection-showcases/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Create First Collection Showcase
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Showcases Grid */}
      {!isLoading && showcases.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={showcases.map((s) => s.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {showcases.map((showcase) => (
                <SortableCollectionShowcaseCard
                  key={showcase.id}
                  showcase={showcase}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Info Card */}
      {!isLoading && showcases.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Display Types</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p><strong>Grid:</strong> 2-column card layout - ideal for featured collections or categories</p>
            <p><strong>Circular:</strong> Horizontal scroll with circular logos - perfect for brand showcases</p>
            <p>* Drag showcases to reorder them on your app</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
