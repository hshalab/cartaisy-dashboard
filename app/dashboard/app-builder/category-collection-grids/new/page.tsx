'use client';

import { useRouter } from 'next/navigation';
import { CategoryCollectionGridForm } from '@/components/app-builder/category-collection-grids/CategoryCollectionGridForm';

export default function CreateCategoryCollectionGridPage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Create Category Collection Grid</h1>
        <p className="text-slate-600 mt-2">Add a new grouped category section with multiple collections</p>
      </div>

      <CategoryCollectionGridForm
        mode="create"
        onSuccess={() => router.push('/dashboard/app-builder/category-collection-grids')}
      />
    </div>
  );
}
