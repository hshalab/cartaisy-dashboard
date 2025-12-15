'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CollectionDisplayForm } from '@/components/app-builder/collection-displays/CollectionDisplayForm';
import { CollectionDisplayItem } from '@/types';
import { Loader2 } from 'lucide-react';

export default function EditCollectionDisplayPage() {
  const router = useRouter();
  const params = useParams();
  const [display, setDisplay] = useState<CollectionDisplayItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDisplay = async () => {
      try {
        const response = await fetch(`/api/components/collection-displays/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch collection display');
        }
        const data = await response.json();
        // Transform MongoDB document to our format
        const item = data.data;
        setDisplay({
          id: item._id || item.id,
          storeId: item.storeId,
          type: item.type,
          collectionId: item.collectionId,
          title: item.title,
          order: item.order,
          isActive: item.isActive,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load collection display');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchDisplay();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !display) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Collection Display</h1>
        </div>
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700">{error || 'Collection display not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Edit Collection Display</h1>
        <p className="text-slate-600 mt-2">Update the settings for this collection display</p>
      </div>

      <CollectionDisplayForm
        mode="edit"
        initialData={display}
        onSuccess={() => router.push('/dashboard/app-builder/collection-displays')}
      />
    </div>
  );
}
