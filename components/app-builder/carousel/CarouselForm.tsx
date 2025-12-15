'use client';

import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth';
import { useState } from 'react';
import { CarouselItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ColorPicker } from '@/components/ui/color-picker';
import { ImagePreview } from '@/components/app-builder/ImagePreview';
import { CollectionSelector } from '@/components/app-builder/CollectionSelector';
import { AlertCircle, CheckCircle2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface CarouselFormProps {
  mode: 'create' | 'edit';
  initialData?: CarouselItem;
  onSuccess: () => void;
}

export function CarouselForm({ mode, initialData, onSuccess }: CarouselFormProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [label, setLabel] = useState(initialData?.label || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '');
  const [ctaText, setCtaText] = useState(initialData?.ctaText || 'Shop Now');
  const [collectionId, setCollectionId] = useState(initialData?.collectionId || '');
  const [endsAt, setEndsAt] = useState(
    initialData?.endsAt ? new Date(initialData.endsAt).toISOString().split('T')[0] : ''
  );
  const [isActive, setIsActive] = useState(initialData?.isActive !== false);

  // Promo tag
  const [showPromoTag, setShowPromoTag] = useState(!!initialData?.promoTag);
  const [promoTagText, setPromoTagText] = useState(initialData?.promoTag?.text || '');
  const [promoTagImageUrl, setPromoTagImageUrl] = useState(initialData?.promoTag?.imageUrl || '');
  const [promoTagBg, setPromoTagBg] = useState(initialData?.promoTag?.backgroundColor || '#FF0000');
  const [promoTagTextColor, setPromoTagTextColor] = useState(initialData?.promoTag?.textColor || '#FFFFFF');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isFormValid =
    imageUrl && label && title && subtitle && ctaText && collectionId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSaving(true);

    try {
      const payload: any = {
        imageUrl,
        label,
        title,
        subtitle,
        ctaText,
        collectionId,
        isActive,
      };

      if (endsAt) {
        payload.endsAt = new Date(endsAt).toISOString();
      }

      if (showPromoTag && promoTagText) {
        payload.promoTag = {
          text: promoTagText,
          imageUrl: promoTagImageUrl || undefined,
          backgroundColor: promoTagBg,
          textColor: promoTagTextColor,
        };
      }

      let response;
      if (mode === 'create') {
        response = await fetch('/api/components/carousel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`/api/components/carousel/${initialData?.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save carousel');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Section */}
      <Card>
        <CardHeader>
          <CardTitle>Hero Image</CardTitle>
          <CardDescription>The main image for your carousel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="imageUrl" className="text-sm font-medium">
              Image URL *
            </Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={isSaving}
              className="mt-2"
            />
          </div>

          {imageUrl && (
            <ImagePreview imageUrl={imageUrl} title={title || 'Carousel image'} className="w-full h-64" />
          )}
        </CardContent>
      </Card>

      {/* Content Section */}
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
          <CardDescription>Text and button content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="label" className="text-sm font-medium">
                Label *
              </Label>
              <Input
                id="label"
                placeholder="e.g., Summer Sale"
                value={label}
                onChange={(e) => setLabel(e.target.value.slice(0, 50))}
                disabled={isSaving}
                maxLength={50}
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">{label.length}/50</p>
            </div>

            <div>
              <Label htmlFor="ctaText" className="text-sm font-medium">
                Button Text *
              </Label>
              <Input
                id="ctaText"
                placeholder="Shop Now"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value.slice(0, 30))}
                disabled={isSaving}
                maxLength={30}
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">{ctaText.length}/30</p>
            </div>
          </div>

          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g., Discover Our New Collection"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 100))}
              disabled={isSaving}
              maxLength={100}
              className="mt-2"
            />
            <p className="text-xs text-slate-500 mt-1">{title.length}/100</p>
          </div>

          <div>
            <Label htmlFor="subtitle" className="text-sm font-medium">
              Subtitle/Description *
            </Label>
            <textarea
              id="subtitle"
              placeholder="e.g., Limited time offer. Shop the latest styles and trends."
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value.slice(0, 200))}
              disabled={isSaving}
              maxLength={200}
              className="mt-2 w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
            <p className="text-xs text-slate-500 mt-1">{subtitle.length}/200</p>
          </div>
        </CardContent>
      </Card>

      {/* Collection & Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Collection & Settings</CardTitle>
          <CardDescription>Link to Shopify collection and set visibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CollectionSelector
            value={collectionId}
            onChange={setCollectionId}
            disabled={isSaving}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="endsAt" className="text-sm font-medium">
                Promotion End Date (Optional)
              </Label>
              <Input
                id="endsAt"
                type="date"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                disabled={isSaving}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Select value={isActive ? 'active' : 'inactive'} onValueChange={(v) => setIsActive(v === 'active')}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promo Tag Section */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => setShowPromoTag(!showPromoTag)}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Promo Tag</CardTitle>
              <CardDescription>Add an optional badge/tag overlay (Optional)</CardDescription>
            </div>
            {showPromoTag ? (
              <ChevronUp className="w-5 h-5 text-slate-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-600" />
            )}
          </div>
        </CardHeader>

        {showPromoTag && (
          <CardContent className="space-y-4 border-t pt-6">
            <div>
              <Label htmlFor="promoTagText" className="text-sm font-medium">
                Tag Text
              </Label>
              <Input
                id="promoTagText"
                placeholder="e.g., SALE, NEW, HOT"
                value={promoTagText}
                onChange={(e) => setPromoTagText(e.target.value.slice(0, 20))}
                disabled={isSaving}
                maxLength={20}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="promoTagImageUrl" className="text-sm font-medium">
                Tag Image URL (Optional)
              </Label>
              <Input
                id="promoTagImageUrl"
                type="url"
                placeholder="https://example.com/badge.png"
                value={promoTagImageUrl}
                onChange={(e) => setPromoTagImageUrl(e.target.value)}
                disabled={isSaving}
                className="mt-2"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <ColorPicker
                value={promoTagBg}
                onChange={setPromoTagBg}
                label="Background Color"
              />
              <ColorPicker
                value={promoTagTextColor}
                onChange={setPromoTagTextColor}
                label="Text Color"
              />
            </div>

            {promoTagText && (
              <div className="mt-4 p-4 border border-slate-200 rounded-lg">
                <p className="text-xs text-slate-600 mb-2">Preview:</p>
                <div
                  className="inline-block px-3 py-1 rounded text-sm font-bold"
                  style={{
                    backgroundColor: promoTagBg,
                    color: promoTagTextColor,
                  }}
                >
                  {promoTagText}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">
            Carousel item {mode === 'create' ? 'created' : 'updated'} successfully!
          </p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700"
          disabled={!isFormValid || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </>
          ) : mode === 'create' ? (
            'Create Carousel'
          ) : (
            'Update Carousel'
          )}
        </Button>
      </div>
    </form>
  );
}
