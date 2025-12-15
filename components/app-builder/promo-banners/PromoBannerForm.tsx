'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PromoBannerItem } from '@/types';
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

interface PromoBannerFormProps {
  mode: 'create' | 'edit';
  initialData?: PromoBannerItem;
  onSuccess: () => void;
}

export function PromoBannerForm({ mode, initialData, onSuccess }: PromoBannerFormProps) {
  const router = useRouter();

  const [image, setImage] = useState(initialData?.image || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '');
  const [ctaText, setCtaText] = useState(initialData?.ctaText || 'Shop Now');
  const [collectionId, setCollectionId] = useState(initialData?.collectionId || '');
  const [isActive, setIsActive] = useState(initialData?.isActive !== false);

  // Style options
  const [showStyleOptions, setShowStyleOptions] = useState(
    !!(initialData?.backgroundColor && initialData.backgroundColor !== '#ffffff') ||
    !!(initialData?.textColor && initialData.textColor !== '#000000') ||
    !!(initialData?.buttonColor && initialData.buttonColor !== '#007bff')
  );
  const [backgroundColor, setBackgroundColor] = useState(initialData?.backgroundColor || '#ffffff');
  const [textColor, setTextColor] = useState(initialData?.textColor || '#000000');
  const [buttonColor, setButtonColor] = useState(initialData?.buttonColor || '#007bff');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isFormValid = image && title && subtitle && ctaText && collectionId;

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
        image,
        title,
        subtitle,
        ctaText,
        collectionId,
        isActive,
        backgroundColor,
        textColor,
        buttonColor,
      };

      let response;
      if (mode === 'create') {
        response = await fetch('/api/components/promo-banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`/api/components/promo-banners/${initialData?.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save promo banner');
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
          <CardTitle>Banner Image</CardTitle>
          <CardDescription>The image displayed on the right side of the banner</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="image" className="text-sm font-medium">
              Image URL *
            </Label>
            <Input
              id="image"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              disabled={isSaving}
              className="mt-2"
            />
          </div>

          {image && (
            <ImagePreview imageUrl={image} title={title || 'Promo banner image'} className="w-full h-48" />
          )}
        </CardContent>
      </Card>

      {/* Content Section */}
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
          <CardDescription>Text displayed on the left side of the banner</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g., Summer Sale"
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
              placeholder="e.g., Up to 50% off on selected items"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value.slice(0, 200))}
              disabled={isSaving}
              maxLength={200}
              className="mt-2 w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
            <p className="text-xs text-slate-500 mt-1">{subtitle.length}/200</p>
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
        </CardContent>
      </Card>

      {/* Collection & Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Collection & Settings</CardTitle>
          <CardDescription>Link to Shopify collection and visibility settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CollectionSelector
            value={collectionId}
            onChange={setCollectionId}
            disabled={isSaving}
          />

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
        </CardContent>
      </Card>

      {/* Style Options Section */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => setShowStyleOptions(!showStyleOptions)}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Style Options</CardTitle>
              <CardDescription>Customize banner colors (Optional)</CardDescription>
            </div>
            {showStyleOptions ? (
              <ChevronUp className="w-5 h-5 text-slate-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-600" />
            )}
          </div>
        </CardHeader>

        {showStyleOptions && (
          <CardContent className="space-y-4 border-t pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <ColorPicker
                value={backgroundColor}
                onChange={setBackgroundColor}
                label="Background Color"
              />
              <ColorPicker
                value={textColor}
                onChange={setTextColor}
                label="Text Color"
              />
              <ColorPicker
                value={buttonColor}
                onChange={setButtonColor}
                label="Button Color"
              />
            </div>

            {/* Split Layout Preview */}
            <div className="mt-4 p-4 border border-slate-200 rounded-lg">
              <p className="text-xs text-slate-600 mb-2">Preview (Split Layout):</p>
              <div
                className="rounded-lg overflow-hidden flex"
                style={{ backgroundColor }}
              >
                {/* Left: Text Content */}
                <div className="flex-1 p-4 flex flex-col justify-center">
                  <h4 className="font-bold text-lg" style={{ color: textColor }}>
                    {title || 'Banner Title'}
                  </h4>
                  <p className="text-sm mt-1" style={{ color: textColor }}>
                    {subtitle || 'Banner description text goes here'}
                  </p>
                  <button
                    type="button"
                    className="mt-3 px-4 py-2 rounded text-sm font-medium text-white w-fit"
                    style={{ backgroundColor: buttonColor }}
                  >
                    {ctaText || 'Shop Now'}
                  </button>
                </div>
                {/* Right: Image placeholder */}
                <div className="w-1/3 bg-slate-200 flex items-center justify-center min-h-[120px]">
                  {image ? (
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-slate-400">Image</span>
                  )}
                </div>
              </div>
            </div>
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
            Promo banner {mode === 'create' ? 'created' : 'updated'} successfully!
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
            'Create Promo Banner'
          ) : (
            'Update Promo Banner'
          )}
        </Button>
      </div>
    </form>
  );
}
