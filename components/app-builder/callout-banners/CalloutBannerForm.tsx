'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CalloutBannerItem } from '@/types';
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

interface CalloutBannerFormProps {
  mode: 'create' | 'edit';
  initialData?: CalloutBannerItem;
  onSuccess: () => void;
}

export function CalloutBannerForm({ mode, initialData, onSuccess }: CalloutBannerFormProps) {
  const router = useRouter();

  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [subTitle, setSubTitle] = useState(initialData?.subTitle || '');
  const [buttonText, setButtonText] = useState(initialData?.buttonText || 'Shop Now');
  const [actionType, setActionType] = useState<'collection' | 'navigation'>(
    initialData?.action?.type || 'collection'
  );
  const [collectionId, setCollectionId] = useState(initialData?.action?.collectionId || '');
  const [navigateTo, setNavigateTo] = useState(initialData?.action?.navigateTo || '');
  const [isActive, setIsActive] = useState(initialData?.isActive !== false);

  // Style options
  const [showStyleOptions, setShowStyleOptions] = useState(
    !!(initialData?.backgroundColor || initialData?.textColor || initialData?.buttonColor)
  );
  const [backgroundColor, setBackgroundColor] = useState(initialData?.backgroundColor || '#FFFFFF');
  const [textColor, setTextColor] = useState(initialData?.textColor || '#000000');
  const [buttonColor, setButtonColor] = useState(initialData?.buttonColor || '#3B82F6');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isFormValid =
    imageUrl &&
    title &&
    subTitle &&
    buttonText &&
    (actionType === 'collection' ? collectionId : navigateTo);

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
        title,
        subTitle,
        buttonText,
        action: {
          type: actionType,
          ...(actionType === 'collection'
            ? { collectionId }
            : { navigateTo }),
        },
        isActive,
      };

      if (showStyleOptions) {
        payload.backgroundColor = backgroundColor;
        payload.textColor = textColor;
        payload.buttonColor = buttonColor;
      }

      let response;
      if (mode === 'create') {
        response = await fetch('/api/components/callout-banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`/api/components/callout-banners/${initialData?.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save callout banner');
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
          <CardDescription>The icon or image for your callout banner</CardDescription>
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
            <ImagePreview imageUrl={imageUrl} title={title || 'Banner image'} className="w-full h-48" />
          )}
        </CardContent>
      </Card>

      {/* Content Section */}
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
          <CardDescription>Banner text and button content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g., Free Shipping"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 100))}
              disabled={isSaving}
              maxLength={100}
              className="mt-2"
            />
            <p className="text-xs text-slate-500 mt-1">{title.length}/100</p>
          </div>

          <div>
            <Label htmlFor="subTitle" className="text-sm font-medium">
              Subtitle/Description *
            </Label>
            <textarea
              id="subTitle"
              placeholder="e.g., On all orders over $50"
              value={subTitle}
              onChange={(e) => setSubTitle(e.target.value.slice(0, 200))}
              disabled={isSaving}
              maxLength={200}
              className="mt-2 w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
            <p className="text-xs text-slate-500 mt-1">{subTitle.length}/200</p>
          </div>

          <div>
            <Label htmlFor="buttonText" className="text-sm font-medium">
              Button Text *
            </Label>
            <Input
              id="buttonText"
              placeholder="Shop Now"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value.slice(0, 30))}
              disabled={isSaving}
              maxLength={30}
              className="mt-2"
            />
            <p className="text-xs text-slate-500 mt-1">{buttonText.length}/30</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Section */}
      <Card>
        <CardHeader>
          <CardTitle>Action</CardTitle>
          <CardDescription>What happens when the user taps the banner</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Action Type *</Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="actionType"
                  value="collection"
                  checked={actionType === 'collection'}
                  onChange={() => setActionType('collection')}
                  disabled={isSaving}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Collection</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="actionType"
                  value="navigation"
                  checked={actionType === 'navigation'}
                  onChange={() => setActionType('navigation')}
                  disabled={isSaving}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Navigation</span>
              </label>
            </div>
          </div>

          {actionType === 'collection' && (
            <CollectionSelector
              value={collectionId}
              onChange={setCollectionId}
              disabled={isSaving}
            />
          )}

          {actionType === 'navigation' && (
            <div>
              <Label htmlFor="navigateTo" className="text-sm font-medium">
                Navigate To *
              </Label>
              <Input
                id="navigateTo"
                placeholder="e.g., /account, /wishlist, /cart"
                value={navigateTo}
                onChange={(e) => setNavigateTo(e.target.value)}
                disabled={isSaving}
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">
                Enter the screen path to navigate to
              </p>
            </div>
          )}

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

            {/* Preview */}
            <div className="mt-4 p-4 border border-slate-200 rounded-lg">
              <p className="text-xs text-slate-600 mb-2">Preview:</p>
              <div
                className="p-4 rounded-lg flex items-center justify-between"
                style={{ backgroundColor }}
              >
                <div>
                  <p className="font-semibold" style={{ color: textColor }}>
                    {title || 'Banner Title'}
                  </p>
                  <p className="text-sm" style={{ color: textColor }}>
                    {subTitle || 'Banner subtitle text'}
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 rounded text-sm font-medium text-white"
                  style={{ backgroundColor: buttonColor }}
                >
                  {buttonText || 'Button'}
                </button>
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
            Callout banner {mode === 'create' ? 'created' : 'updated'} successfully!
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
            'Create Callout Banner'
          ) : (
            'Update Callout Banner'
          )}
        </Button>
      </div>
    </form>
  );
}
