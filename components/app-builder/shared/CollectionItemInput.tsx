'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CollectionSelector } from '@/components/app-builder/CollectionSelector';
import { X, Image as ImageIcon } from 'lucide-react';

export interface CollectionItemData {
  image: string;
  title: string;
  collectionId: string;
}

interface CollectionItemInputProps {
  index: number;
  item: CollectionItemData;
  onChange: (index: number, field: keyof CollectionItemData, value: string) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  disabled?: boolean;
  variant?: 'default' | 'compact';
}

export function CollectionItemInput({
  index,
  item,
  onChange,
  onRemove,
  canRemove,
  disabled,
  variant = 'default',
}: CollectionItemInputProps) {
  if (variant === 'compact') {
    return (
      <div className="relative p-3 border border-slate-200 rounded-lg bg-slate-50">
        {/* Remove Button */}
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute top-1 right-1 h-6 w-6 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
            onClick={() => onRemove(index)}
            disabled={disabled}
          >
            <X className="w-3 h-3" />
          </Button>
        )}

        <div className="flex gap-3 pr-6">
          {/* Image Preview */}
          <div className="flex-shrink-0">
            {item.image ? (
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200">
                <img
                  src={item.image}
                  alt={item.title || 'Collection'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect fill="%23e2e8f0" width="48" height="48"/></svg>';
                  }}
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-white">
                <ImageIcon className="w-4 h-4 text-slate-400" />
              </div>
            )}
          </div>

          {/* Fields */}
          <div className="flex-1 space-y-2">
            <Input
              type="url"
              placeholder="Image URL"
              value={item.image}
              onChange={(e) => onChange(index, 'image', e.target.value)}
              disabled={disabled}
              className="h-8 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Title"
                value={item.title}
                onChange={(e) => onChange(index, 'title', e.target.value.slice(0, 50))}
                disabled={disabled}
                maxLength={50}
                className="h-8 text-sm"
              />
              <CollectionSelector
                value={item.collectionId}
                onChange={(value) => onChange(index, 'collectionId', value)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-4 border border-slate-200 rounded-lg bg-slate-50">
      {/* Remove Button */}
      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
          onClick={() => onRemove(index)}
          disabled={disabled}
        >
          <X className="w-4 h-4" />
        </Button>
      )}

      <div className="pr-8 space-y-4">
        {/* Collection Number Badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-slate-700">Collection Item</span>
        </div>

        {/* Image URL and Preview */}
        <div className="flex gap-4">
          {/* Image Preview */}
          <div className="flex-shrink-0">
            {item.image ? (
              <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
                <img
                  src={item.image}
                  alt={item.title || 'Collection image'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect fill="%23e2e8f0" width="80" height="80"/><text fill="%2394a3b8" font-size="10" x="50%" y="50%" text-anchor="middle" dy=".3em">Error</text></svg>';
                  }}
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-white">
                <ImageIcon className="w-6 h-6 text-slate-400" />
              </div>
            )}
          </div>

          {/* Image URL Input */}
          <div className="flex-1">
            <Label className="text-xs font-medium text-slate-600">Image URL *</Label>
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={item.image}
              onChange={(e) => onChange(index, 'image', e.target.value)}
              disabled={disabled}
              className="mt-1"
            />
          </div>
        </div>

        {/* Title and Collection in a row */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="text-xs font-medium text-slate-600">Title *</Label>
            <Input
              placeholder="e.g., Summer Dresses"
              value={item.title}
              onChange={(e) => onChange(index, 'title', e.target.value.slice(0, 50))}
              disabled={disabled}
              maxLength={50}
              className="mt-1"
            />
            <p className="text-xs text-slate-400 mt-0.5">{item.title.length}/50</p>
          </div>

          <div>
            <Label className="text-xs font-medium text-slate-600">Collection *</Label>
            <div className="mt-1">
              <CollectionSelector
                value={item.collectionId}
                onChange={(value) => onChange(index, 'collectionId', value)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
