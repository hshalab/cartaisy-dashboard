'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CollectionDisplayItem } from '@/types';
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
import { SortableCollectionDisplayCard } from '@/components/app-builder/collection-displays/SortableCollectionDisplayCard';

export default function CollectionDisplaysListPage() {
  const [displays, setDisplays] = useState<CollectionDisplayItem[]>([]);
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

  const fetchDisplays = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/components/collection-displays');

      if (!response.ok) {
        throw new Error('Failed to fetch collection displays');
      }

      const data = await response.json();
      // Transform MongoDB documents to our format
      const transformedData = (data.data || []).map((item: any) => ({
        id: item._id || item.id,
        storeId: item.storeId,
        type: item.type,
        collectionId: item.collectionId,
        title: item.title,
        order: item.order,
        isActive: item.isActive,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));
      setDisplays(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collection displays');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDisplays();
  }, []);

  const handleDelete = () => {
    fetchDisplays();
  };

  const handleToggleActive = () => {
    fetchDisplays();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = displays.findIndex((d) => d.id === active.id);
      const newIndex = displays.findIndex((d) => d.id === over.id);

      const newItems = arrayMove(displays, oldIndex, newIndex);
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        order: index,
      }));

      setDisplays(updatedItems);

      try {
        const items = updatedItems.map((d) => ({
          id: d.id,
          order: d.order,
        }));

        await fetch('/api/components/collection-displays/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        });
      } catch (err) {
        console.error('Failed to save order:', err);
        fetchDisplays();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Collection Displays</h1>
          <p className="text-slate-600 mt-1">Manage your product collection displays</p>
        </div>
        <Link href="/dashboard/app-builder/collection-displays/new">
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
      {!isLoading && displays.length === 0 && !error && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No collection displays yet
            </h3>
            <p className="text-slate-600 mb-6">
              Create your first collection display to showcase products from your Shopify collections
            </p>
            <Link href="/dashboard/app-builder/collection-displays/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Create First Collection Display
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Displays Grid */}
      {!isLoading && displays.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={displays.map((d) => d.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displays.map((display) => (
                <SortableCollectionDisplayCard
                  key={display.id}
                  display={display}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Info Card */}
      {!isLoading && displays.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Display Types</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p><strong>Large Row:</strong> Horizontal scroll with large product cards - great for featured products</p>
            <p><strong>Small Grid:</strong> 2-column grid layout - perfect for category browsing</p>
            <p><strong>Medium Row:</strong> Horizontal scroll with progress indicator - ideal for sales and limited offers</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
