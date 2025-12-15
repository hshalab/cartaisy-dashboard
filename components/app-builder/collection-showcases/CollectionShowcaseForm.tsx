'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CollectionShowcaseItem, ShowcaseCollectionItem } from '@/types';
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
import { CollectionItemInput, CollectionItemData } from '@/components/app-builder/shared/CollectionItemInput';
import { AlertCircle, CheckCircle2, Loader2, Plus, LayoutGrid, Circle } from 'lucide-react';

interface CollectionShowcaseFormProps {
  mode: 'create' | 'edit';
  initialData?: CollectionShowcaseItem;
  onSuccess: () => void;
}

type ShowcaseType = 'grid' | 'circular';

const showcaseTypeOptions: { value: ShowcaseType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'grid',
    label: 'Grid Layout',
    description: '2-column card layout for collections',
    icon: <LayoutGrid className="w-6 h-6" />,
  },
  {
    value: 'circular',
    label: 'Circular Logos',
    description: 'Horizontal scroll with circular brand logos',
    icon: <Circle className="w-6 h-6" />,
  },
];

const emptyCollectionItem: ShowcaseCollectionItem = {
  image: '',
  title: '',
  collectionId: '',
};

export function CollectionShowcaseForm({ mode, initialData, onSuccess }: CollectionShowcaseFormProps) {
  const router = useRouter();

  const [type, setType] = useState<ShowcaseType>(initialData?.type || 'grid');
  const [title, setTitle] = useState(initialData?.title || '');
  const [icon, setIcon] = useState(initialData?.icon || '');
  const [isActive, setIsActive] = useState(initialData?.isActive !== false);
  const [collections, setCollections] = useState<ShowcaseCollectionItem[]>(
    initialData?.collections?.length ? initialData.collections : [{ ...emptyCollectionItem }]
  );

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Validate form
  const isCollectionsValid = collections.every(
    (c) => c.image && c.title && c.collectionId
  );
  const isFormValid = type && title && collections.length >= 1 && isCollectionsValid;

  const handleCollectionChange = (index: number, field: keyof CollectionItemData, value: string) => {
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
      setError('Please fill in all required fields');
      return;
    }

    setIsSaving(true);

    try {
      const payload: any = {
        type,
        title,
        collections,
        isActive,
      };

      if (icon.trim()) {
        payload.icon = icon.trim();
      }

      let response;
      if (mode === 'create') {
        response = await fetch('/api/components/collection-showcases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`/api/components/collection-showcases/${initialData?.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save collection showcase');
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
          <CardDescription>Choose how collections will be displayed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {showcaseTypeOptions.map((option) => (
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

                {/* Icon */}
                <div className="mb-3">
                  <div className={`inline-flex p-3 rounded-lg ${
                    type === option.value ? 'bg-blue-100' : 'bg-slate-100'
                  }`}>
                    {option.icon}
                  </div>
                </div>

                {/* Visual Preview */}
                <div className="mb-3 p-2 bg-slate-100 rounded-lg">
                  {option.value === 'grid' && (
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="aspect-[4/3] bg-slate-300 rounded" />
                      <div className="aspect-[4/3] bg-slate-300 rounded" />
                      <div className="aspect-[4/3] bg-slate-300 rounded" />
                      <div className="aspect-[4/3] bg-slate-300 rounded" />
                    </div>
                  )}
                  {option.value === 'circular' && (
                    <div className="flex gap-2 justify-center py-2">
                      <div className="w-10 h-10 bg-slate-300 rounded-full" />
                      <div className="w-10 h-10 bg-slate-300 rounded-full" />
                      <div className="w-10 h-10 bg-slate-300 rounded-full" />
                      <div className="w-6 h-10 bg-slate-200 rounded-full" />
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

      {/* Section Info */}
      <Card>
        <CardHeader>
          <CardTitle>Section Info</CardTitle>
          <CardDescription>Title and optional icon for this showcase section</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Section Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g., Shop by Brand, Featured Collections"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 100))}
              disabled={isSaving}
              maxLength={100}
              className="mt-2"
            />
            <p className="text-xs text-slate-500 mt-1">{title.length}/100</p>
          </div>

          <div>
            <Label htmlFor="icon" className="text-sm font-medium">
              Section Icon (Optional)
            </Label>
            <Input
              id="icon"
              placeholder="e.g., shopping-bag, star, heart"
              value={icon}
              onChange={(e) => setIcon(e.target.value.slice(0, 50))}
              disabled={isSaving}
              maxLength={50}
              className="mt-2"
            />
            <p className="text-xs text-slate-500 mt-1">Icon name to display next to the title</p>
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
              <CardDescription>Add collections to display in this showcase (minimum 1)</CardDescription>
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
        </CardContent>
      </Card>

      {/* Preview */}
      {collections.length > 0 && collections.some(c => c.image || c.title) && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              {type === 'grid' ? '2-column grid layout' : 'Circular logos with horizontal scroll'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-slate-100 rounded-lg">
              {/* Section Header */}
              <div className="mb-4">
                <h3 className="font-bold text-lg text-slate-900">{title || 'Section Title'}</h3>
              </div>

              {/* Preview based on type */}
              {type === 'grid' ? (
                <div className="grid grid-cols-2 gap-3">
                  {collections.map((collection, index) => (
                    <div
                      key={index}
                      className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-200"
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
                        <span className="text-white text-sm font-medium p-2 truncate w-full">
                          {collection.title || `Collection ${index + 1}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {collections.map((collection, index) => (
                    <div key={index} className="flex-shrink-0 text-center">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 mx-auto border-2 border-white shadow-sm">
                        {collection.image ? (
                          <img
                            src={collection.image}
                            alt={collection.title || 'Brand'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Circle className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 mt-1 truncate max-w-[80px]">
                        {collection.title || `Brand ${index + 1}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
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
            Collection showcase {mode === 'create' ? 'created' : 'updated'} successfully!
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
            'Create Collection Showcase'
          ) : (
            'Update Collection Showcase'
          )}
        </Button>
      </div>
    </form>
  );
}
