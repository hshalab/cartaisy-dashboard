'use client';

import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth';
import { useState } from 'react';
import { CategoryGridItem } from '@/types';
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
import { ImagePreview } from '@/components/app-builder/ImagePreview';
import { CollectionSelector } from '@/components/app-builder/CollectionSelector';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface CategoryGridFormProps {
  mode: 'create' | 'edit';
  initialData?: CategoryGridItem;
  onSuccess: () => void;
}

export function CategoryGridForm({ mode, initialData, onSuccess }: CategoryGridFormProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [collectionId, setCollectionId] = useState(initialData?.collectionId || '');
  const [isActive, setIsActive] = useState(initialData?.isActive !== false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isFormValid = imageUrl && title && collectionId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        imageUrl,
        title,
        collectionId,
        isActive,
      };

      let response;
      if (mode === 'create') {
        response = await fetch('/api/components/category-grid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`/api/components/category-grid/${initialData?.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save category grid item');
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
          <CardTitle>Category Icon/Image</CardTitle>
          <CardDescription>The image for your category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="imageUrl" className="text-sm font-medium">
              Image URL *
            </Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/category.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={isSaving}
              className="mt-2"
            />
          </div>

          {imageUrl && (
            <ImagePreview imageUrl={imageUrl} title={title || 'Category image'} className="w-full h-48" />
          )}
        </CardContent>
      </Card>

      {/* Content Section */}
      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
          <CardDescription>Title and collection link</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Category Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g., Men's Clothing"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 50))}
              disabled={isSaving}
              maxLength={50}
              className="mt-2"
            />
            <p className="text-xs text-slate-500 mt-1">{title.length}/50</p>
          </div>

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
            Category grid item {mode === 'create' ? 'created' : 'updated'} successfully!
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
            'Create Category'
          ) : (
            'Update Category'
          )}
        </Button>
      </div>
    </form>
  );
}
