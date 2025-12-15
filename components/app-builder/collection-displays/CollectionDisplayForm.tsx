'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CollectionDisplayItem } from '@/types';
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
import { CollectionSelector } from '@/components/app-builder/CollectionSelector';
import { AlertCircle, CheckCircle2, Loader2, LayoutGrid, Rows3, GalleryHorizontal } from 'lucide-react';

interface CollectionDisplayFormProps {
  mode: 'create' | 'edit';
  initialData?: CollectionDisplayItem;
  onSuccess: () => void;
}

type DisplayType = 'large_row' | 'small_grid' | 'medium_row';

const displayTypeOptions: { value: DisplayType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'large_row',
    label: 'Large Row',
    description: 'Horizontal scroll with large product cards',
    icon: <GalleryHorizontal className="w-6 h-6" />,
  },
  {
    value: 'small_grid',
    label: 'Small Grid',
    description: '2-column grid layout',
    icon: <LayoutGrid className="w-6 h-6" />,
  },
  {
    value: 'medium_row',
    label: 'Medium Row',
    description: 'Horizontal scroll with progress bar (great for sales)',
    icon: <Rows3 className="w-6 h-6" />,
  },
];

export function CollectionDisplayForm({ mode, initialData, onSuccess }: CollectionDisplayFormProps) {
  const router = useRouter();

  const [type, setType] = useState<DisplayType>(initialData?.type || 'large_row');
  const [collectionId, setCollectionId] = useState(initialData?.collectionId || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [isActive, setIsActive] = useState(initialData?.isActive !== false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isFormValid = type && collectionId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setError('Please select a display type and collection');
      return;
    }

    setIsSaving(true);

    try {
      const payload: any = {
        type,
        collectionId,
        isActive,
      };

      if (title.trim()) {
        payload.title = title.trim();
      }

      let response;
      if (mode === 'create') {
        response = await fetch('/api/components/collection-displays', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`/api/components/collection-displays/${initialData?.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save collection display');
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
      {/* Display Type Section */}
      <Card>
        <CardHeader>
          <CardTitle>Display Type</CardTitle>
          <CardDescription>Choose how products will be displayed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {displayTypeOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => !isSaving && setType(option.value)}
                className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                  type === option.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {/* Selection indicator */}
                {type === option.value && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                )}

                {/* Icon and Visual Preview */}
                <div className="mb-3">
                  <div className={`inline-flex p-3 rounded-lg ${
                    type === option.value ? 'bg-blue-100' : 'bg-slate-100'
                  }`}>
                    {option.icon}
                  </div>
                </div>

                {/* Visual Preview */}
                <div className="mb-3 p-2 bg-slate-100 rounded-lg">
                  {option.value === 'large_row' && (
                    <div className="flex gap-2 overflow-hidden">
                      <div className="w-16 h-20 bg-slate-300 rounded flex-shrink-0" />
                      <div className="w-16 h-20 bg-slate-300 rounded flex-shrink-0" />
                      <div className="w-8 h-20 bg-slate-200 rounded flex-shrink-0" />
                    </div>
                  )}
                  {option.value === 'small_grid' && (
                    <div className="grid grid-cols-2 gap-1">
                      <div className="h-10 bg-slate-300 rounded" />
                      <div className="h-10 bg-slate-300 rounded" />
                      <div className="h-10 bg-slate-300 rounded" />
                      <div className="h-10 bg-slate-300 rounded" />
                    </div>
                  )}
                  {option.value === 'medium_row' && (
                    <div>
                      <div className="flex gap-1 mb-1 overflow-hidden">
                        <div className="w-12 h-14 bg-slate-300 rounded flex-shrink-0" />
                        <div className="w-12 h-14 bg-slate-300 rounded flex-shrink-0" />
                        <div className="w-6 h-14 bg-slate-200 rounded flex-shrink-0" />
                      </div>
                      <div className="h-1 bg-slate-200 rounded-full">
                        <div className="h-1 w-1/3 bg-slate-400 rounded-full" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Label and Description */}
                <h4 className="font-semibold text-slate-900">{option.label}</h4>
                <p className="text-xs text-slate-600 mt-1">{option.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Collection Section */}
      <Card>
        <CardHeader>
          <CardTitle>Collection</CardTitle>
          <CardDescription>Select the Shopify collection to display products from</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CollectionSelector
            value={collectionId}
            onChange={setCollectionId}
            disabled={isSaving}
          />
        </CardContent>
      </Card>

      {/* Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Optional title override and visibility settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Title Override (Optional)
            </Label>
            <Input
              id="title"
              placeholder="Leave empty to use collection title"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 100))}
              disabled={isSaving}
              maxLength={100}
              className="mt-2"
            />
            <p className="text-xs text-slate-500 mt-1">
              {title.length}/100 - If left empty, the collection title will be used
            </p>
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
        </CardContent>
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
            Collection display {mode === 'create' ? 'created' : 'updated'} successfully!
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
            'Create Collection Display'
          ) : (
            'Update Collection Display'
          )}
        </Button>
      </div>
    </form>
  );
}
