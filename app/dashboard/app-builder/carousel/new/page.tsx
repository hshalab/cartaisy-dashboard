'use client';

import { useRouter } from 'next/navigation';
import { CarouselForm } from '@/components/app-builder/carousel/CarouselForm';

export default function CreateCarouselPage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Create New Carousel</h1>
        <p className="text-slate-600 mt-2">Add a new hero carousel banner to your store</p>
      </div>

      <CarouselForm
        mode="create"
        onSuccess={() => router.push('/dashboard/app-builder/carousel')}
      />
    </div>
  );
}
