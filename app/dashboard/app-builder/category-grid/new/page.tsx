'use client';

import { useRouter } from 'next/navigation';
import { CategoryGridForm } from '@/components/app-builder/category-grid/CategoryGridForm';

export default function CreateCategoryGridPage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Create New Category</h1>
        <p className="text-slate-600 mt-2">Add a new category to your category grid</p>
      </div>

      <CategoryGridForm
        mode="create"
        onSuccess={() => router.push('/dashboard/app-builder/category-grid')}
      />
    </div>
  );
}
