'use client';

import { useRouter } from 'next/navigation';
import { PromoBannerForm } from '@/components/app-builder/promo-banners/PromoBannerForm';

export default function CreatePromoBannerPage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Create New Promo Banner</h1>
        <p className="text-slate-600 mt-2">Add a new promotional banner with split-layout design</p>
      </div>

      <PromoBannerForm
        mode="create"
        onSuccess={() => router.push('/dashboard/app-builder/promo-banners')}
      />
    </div>
  );
}
