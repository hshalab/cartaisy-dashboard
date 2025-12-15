'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CategoryCollectionGridForm } from '@/components/app-builder/category-collection-grids/CategoryCollectionGridForm';
import { CategoryCollectionGridItem } from '@/types';
import { Loader2 } from 'lucide-react';

export default function EditCategoryCollectionGridPage() {
  const router = useRouter();
  const params = useParams();
  const [grid, setGrid] = useState<CategoryCollectionGridItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGrid = async () => {
      try {
        const response = await fetch(`/api/components/category-collection-grids/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch category collection grid');
        }
        const data = await response.json();
        // Transform MongoDB document to our format
        const item = data.data;
        setGrid({
          id: item._id || item.id,
          storeId: item.storeId,
          title: item.title,
          subtitle: item.subtitle,
          collections: item.collections || [],
          position: item.position,
          isActive: item.isActive,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load category collection grid');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchGrid();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !grid) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Category Collection Grid</h1>
        </div>
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700">{error || 'Category collection grid not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Edit Category Collection Grid</h1>
        <p className="text-slate-600 mt-2">Update the collections in this category grid</p>
      </div>

      <CategoryCollectionGridForm
        mode="edit"
        initialData={grid}
        onSuccess={() => router.push('/dashboard/app-builder/category-collection-grids')}
      />
    </div>
  );
}
