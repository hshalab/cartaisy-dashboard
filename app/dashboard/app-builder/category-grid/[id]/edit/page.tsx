'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CategoryGridForm } from '@/components/app-builder/category-grid/CategoryGridForm';
import { CategoryGridItem } from '@/types';
import { Loader2 } from 'lucide-react';

export default function EditCategoryGridPage() {
  const router = useRouter();
  const params = useParams();
  const [categoryGrid, setCategoryGrid] = useState<CategoryGridItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategoryGrid = async () => {
      try {
        const response = await fetch(`/api/components/category-grid/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch category grid item');
        }
        const data = await response.json();
        setCategoryGrid(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load category grid item');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchCategoryGrid();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !categoryGrid) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Category</h1>
        </div>
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700">{error || 'Category grid item not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Edit Category</h1>
        <p className="text-slate-600 mt-2">Update the details of your category</p>
      </div>

      <CategoryGridForm
        mode="edit"
        initialData={categoryGrid}
        onSuccess={() => router.push('/dashboard/app-builder/category-grid')}
      />
    </div>
  );
}
