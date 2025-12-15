'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CarouselItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { SortableCarouselCard } from '@/components/app-builder/carousel/SortableCarouselCard';

export default function CarouselListPage() {
  const [carousels, setCarousels] = useState<CarouselItem[]>([]);
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

  const fetchCarousels = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/components/carousel');

      if (!response.ok) {
        throw new Error('Failed to fetch carousels');
      }

      const data = await response.json();
      setCarousels(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load carousels');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCarousels();
  }, []);

  const handleDelete = () => {
    fetchCarousels();
  };

  const handleToggleActive = () => {
    fetchCarousels();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = carousels.findIndex((c) => c.id === active.id);
      const newIndex = carousels.findIndex((c) => c.id === over.id);

      const newCarousels = arrayMove(carousels, oldIndex, newIndex);

      // Update positions locally
      const updatedCarousels = newCarousels.map((carousel, index) => ({
        ...carousel,
        position: index,
      }));

      setCarousels(updatedCarousels);

      // Save to backend
      try {
        const items = updatedCarousels.map((c) => ({
          id: c.id,
          position: c.position,
        }));

        await fetch('/api/components/carousel/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        });
      } catch (err) {
        console.error('Failed to save order:', err);
        // Refresh to get correct order on error
        fetchCarousels();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Carousel Items</h1>
          <p className="text-slate-600 mt-1">Manage your hero carousel banners</p>
        </div>
        <Link href="/dashboard/app-builder/carousel/new">
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
      {!isLoading && carousels.length === 0 && !error && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No carousel items yet
            </h3>
            <p className="text-slate-600 mb-6">
              Create your first carousel item to get started with hero banners
            </p>
            <Link href="/dashboard/app-builder/carousel/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Create First Carousel
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Carousel Grid */}
      {!isLoading && carousels.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={carousels.map((c) => c.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {carousels.map((carousel) => (
                <SortableCarouselCard
                  key={carousel.id}
                  carousel={carousel}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Info Card */}
      {!isLoading && carousels.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>✓ Drag carousel items to reorder them</p>
            <p>✓ Toggle active/inactive to show/hide items</p>
            <p>✓ Carousels will auto-scroll on the mobile app</p>
            <p>✓ Set an end date to automatically hide promotions</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
