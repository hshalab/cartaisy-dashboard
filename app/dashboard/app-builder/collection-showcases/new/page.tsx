'use client';

import { useRouter } from 'next/navigation';
import { CollectionShowcaseForm } from '@/components/app-builder/collection-showcases/CollectionShowcaseForm';

export default function CreateCollectionShowcasePage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Create Collection Showcase</h1>
        <p className="text-slate-600 mt-2">Add a new collection display section with grid or circular layout</p>
      </div>

      <CollectionShowcaseForm
        mode="create"
        onSuccess={() => router.push('/dashboard/app-builder/collection-showcases')}
      />
    </div>
  );
}
