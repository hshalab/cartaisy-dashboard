'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CategoryCollectionGridItem, CollectionGridItem } from '@/types';
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
import { CollectionItemInput } from './CollectionItemInput';
import { AlertCircle, CheckCircle2, Loader2, Plus, LayoutGrid } from 'lucide-react';

interface CategoryCollectionGridFormProps {
  mode: 'create' | 'edit';
  initialData?: CategoryCollectionGridItem;
  onSuccess: () => void;
}

const emptyCollectionItem: CollectionGridItem = {
  image: '',
  title: '',
  collectionId: '',
};

export function CategoryCollectionGridForm({ mode, initialData, onSuccess }: CategoryCollectionGridFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '');
  const [isActive, setIsActive] = useState(initialData?.isActive !== false);
  const [collections, setCollections] = useState<CollectionGridItem[]>(
    initialData?.collections?.length ? initialData.collections : [{ ...emptyCollectionItem }]
  );

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Validate form
  const isCollectionsValid = collections.every(
    (c) => c.image && c.title && c.collectionId
  );
  const isFormValid = title && subtitle && collections.length >= 1 && isCollectionsValid;

  const handleCollectionChange = (index: number, field: keyof CollectionGridItem, value: string) => {
    const newCollections = [...collections];
    newCollections[index] = { ...newCollections[index], [field]: value };
    setCollections(newCollections);
  };

  const handleAddCollection = () => {
    setCollections([...collections, { ...emptyCollectionItem }]);
  };

  const handleRemoveCollection = (index: number) => {
    if (collections.length > 1) {
      const newCollections = collections.filter((_, i) => i !== index);
      setCollections(newCollections);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setError('Please fill in all required fields for the section and all collections');
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        title,
        subtitle,
        collections,
        isActive,
      };

      let response;
      if (mode === 'create') {
        response = await fetch('/api/components/category-collection-grids', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`/api/components/category-collection-grids/${initialData?.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save category collection grid');
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
      {/* Section Info */}
      <Card>
        <CardHeader>
          <CardTitle>Section Info</CardTitle>
          <CardDescription>Title and subtitle for this category section</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Section Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g., Shop by Category"
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
              Section Subtitle *
            </Label>
            <textarea
              id="subtitle"
              placeholder="e.g., Explore our curated collections"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value.slice(0, 200))}
              disabled={isSaving}
              maxLength={200}
              className="mt-2 w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
            />
            <p className="text-xs text-slate-500 mt-1">{subtitle.length}/200</p>
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

      {/* Collections */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Collections</CardTitle>
              <CardDescription>Add collections to display in this grid (minimum 1)</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCollection}
              disabled={isSaving}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Collection
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {collections.map((collection, index) => (
            <CollectionItemInput
              key={index}
              index={index}
              item={collection}
              onChange={handleCollectionChange}
              onRemove={handleRemoveCollection}
              canRemove={collections.length > 1}
              disabled={isSaving}
            />
          ))}

          {collections.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <LayoutGrid className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>No collections added yet</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCollection}
                disabled={isSaving}
                className="mt-2"
              >
                Add First Collection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid Preview */}
      {collections.length > 0 && collections.some(c => c.image || c.title) && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>How your grid will appear (3-column layout)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-slate-100 rounded-lg">
              {/* Section Header */}
              <div className="text-center mb-4">
                <h3 className="font-bold text-lg text-slate-900">{title || 'Section Title'}</h3>
                <p className="text-sm text-slate-600">{subtitle || 'Section subtitle'}</p>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-3 gap-3">
                {collections.map((collection, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden bg-slate-200"
                  >
                    {collection.image ? (
                      <img
                        src={collection.image}
                        alt={collection.title || 'Collection'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <LayoutGrid className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-end">
                      <span className="text-white text-xs font-medium p-2 truncate w-full">
                        {collection.title || `Collection ${index + 1}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
            Category collection grid {mode === 'create' ? 'created' : 'updated'} successfully!
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
            'Create Category Grid'
          ) : (
            'Update Category Grid'
          )}
        </Button>
      </div>
    </form>
  );
}
