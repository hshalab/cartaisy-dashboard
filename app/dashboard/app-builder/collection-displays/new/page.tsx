'use client';

import { useRouter } from 'next/navigation';
import { CollectionDisplayForm } from '@/components/app-builder/collection-displays/CollectionDisplayForm';

export default function CreateCollectionDisplayPage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Create New Collection Display</h1>
        <p className="text-slate-600 mt-2">Add a new product collection display to your store</p>
      </div>

      <CollectionDisplayForm
        mode="create"
        onSuccess={() => router.push('/dashboard/app-builder/collection-displays')}
      />
    </div>
  );
}
