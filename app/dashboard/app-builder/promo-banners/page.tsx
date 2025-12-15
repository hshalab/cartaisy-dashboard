'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PromoBannerItem } from '@/types';
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
import { SortablePromoBannerCard } from '@/components/app-builder/promo-banners/SortablePromoBannerCard';

export default function PromoBannersListPage() {
  const [banners, setBanners] = useState<PromoBannerItem[]>([]);
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

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/components/promo-banners');

      if (!response.ok) {
        throw new Error('Failed to fetch promo banners');
      }

      const data = await response.json();
      // Transform MongoDB documents to our format
      const transformedData = (data.data || []).map((item: any) => ({
        id: item._id || item.id,
        storeId: item.storeId,
        image: item.image,
        title: item.title,
        subtitle: item.subtitle,
        ctaText: item.ctaText,
        collectionId: item.collectionId,
        position: item.position,
        isActive: item.isActive,
        backgroundColor: item.backgroundColor,
        textColor: item.textColor,
        buttonColor: item.buttonColor,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));
      setBanners(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load promo banners');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = () => {
    fetchBanners();
  };

  const handleToggleActive = () => {
    fetchBanners();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = banners.findIndex((b) => b.id === active.id);
      const newIndex = banners.findIndex((b) => b.id === over.id);

      const newItems = arrayMove(banners, oldIndex, newIndex);
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        position: index,
      }));

      setBanners(updatedItems);

      try {
        const items = updatedItems.map((b) => ({
          id: b.id,
          position: b.position,
        }));

        await fetch('/api/components/promo-banners/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        });
      } catch (err) {
        console.error('Failed to save order:', err);
        fetchBanners();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Promo Banners</h1>
          <p className="text-slate-600 mt-1">Manage your promotional split-layout banners</p>
        </div>
        <Link href="/dashboard/app-builder/promo-banners/new">
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
      {!isLoading && banners.length === 0 && !error && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No promo banners yet
            </h3>
            <p className="text-slate-600 mb-6">
              Create your first promo banner to showcase promotions with split-layout design
            </p>
            <Link href="/dashboard/app-builder/promo-banners/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Create First Promo Banner
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Banners Grid */}
      {!isLoading && banners.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={banners.map((b) => b.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {banners.map((banner) => (
                <SortablePromoBannerCard
                  key={banner.id}
                  banner={banner}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Info Card */}
      {!isLoading && banners.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>* Promo banners display in a split layout with text on the left and image on the right</p>
            <p>* Banners auto-scroll in a carousel on the mobile app</p>
            <p>* Drag banners to reorder them</p>
            <p>* Customize colors to match your brand</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
