'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CarouselForm } from '@/components/app-builder/carousel/CarouselForm';
import { CarouselItem } from '@/types';
import { Loader2 } from 'lucide-react';

export default function EditCarouselPage() {
  const router = useRouter();
  const params = useParams();
  const [carousel, setCarousel] = useState<CarouselItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCarousel = async () => {
      try {
        const response = await fetch(`/api/components/carousel/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch carousel');
        }
        const data = await response.json();
        setCarousel(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load carousel');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchCarousel();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !carousel) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Carousel</h1>
        </div>
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700">{error || 'Carousel not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Edit Carousel</h1>
        <p className="text-slate-600 mt-2">Update the details of your carousel banner</p>
      </div>

      <CarouselForm
        mode="edit"
        initialData={carousel}
        onSuccess={() => router.push('/dashboard/app-builder/carousel')}
      />
    </div>
  );
}
