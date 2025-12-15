'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CalloutBannerForm } from '@/components/app-builder/callout-banners/CalloutBannerForm';
import { CalloutBannerItem } from '@/types';
import { Loader2 } from 'lucide-react';

export default function EditCalloutBannerPage() {
  const router = useRouter();
  const params = useParams();
  const [banner, setBanner] = useState<CalloutBannerItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await fetch(`/api/components/callout-banners/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch callout banner');
        }
        const data = await response.json();
        // Transform MongoDB document to our format
        const item = data.data;
        setBanner({
          id: item._id || item.id,
          storeId: item.storeId,
          imageUrl: item.imageUrl,
          title: item.title,
          subTitle: item.subTitle,
          buttonText: item.buttonText,
          action: item.action,
          position: item.position,
          isActive: item.isActive,
          backgroundColor: item.backgroundColor,
          textColor: item.textColor,
          buttonColor: item.buttonColor,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load callout banner');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchBanner();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !banner) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Callout Banner</h1>
        </div>
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700">{error || 'Callout banner not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Edit Callout Banner</h1>
        <p className="text-slate-600 mt-2">Update the details of your callout banner</p>
      </div>

      <CalloutBannerForm
        mode="edit"
        initialData={banner}
        onSuccess={() => router.push('/dashboard/app-builder/callout-banners')}
      />
    </div>
  );
}
