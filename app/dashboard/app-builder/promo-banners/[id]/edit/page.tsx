'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PromoBannerForm } from '@/components/app-builder/promo-banners/PromoBannerForm';
import { PromoBannerItem } from '@/types';
import { Loader2 } from 'lucide-react';

export default function EditPromoBannerPage() {
  const router = useRouter();
  const params = useParams();
  const [banner, setBanner] = useState<PromoBannerItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await fetch(`/api/components/promo-banners/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch promo banner');
        }
        const data = await response.json();
        // Transform MongoDB document to our format
        const item = data.data;
        setBanner({
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
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load promo banner');
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
          <h1 className="text-3xl font-bold text-slate-900">Edit Promo Banner</h1>
        </div>
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700">{error || 'Promo banner not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Edit Promo Banner</h1>
        <p className="text-slate-600 mt-2">Update the details of your promo banner</p>
      </div>

      <PromoBannerForm
        mode="edit"
        initialData={banner}
        onSuccess={() => router.push('/dashboard/app-builder/promo-banners')}
      />
    </div>
  );
}
