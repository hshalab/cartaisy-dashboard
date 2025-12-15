'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CollectionDisplayItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { GripVertical, MoreVertical, Pencil, Trash2, Loader2, LayoutGrid, Rows3, GalleryHorizontal } from 'lucide-react';

interface CollectionDisplayCardProps {
  display: CollectionDisplayItem;
  collectionTitle?: string;
  onDelete: () => void;
  onToggleActive: () => void;
  isDragging?: boolean;
  dragHandleProps?: any;
}

const displayTypeConfig = {
  large_row: {
    label: 'Large Row',
    icon: GalleryHorizontal,
    color: 'bg-blue-100 text-blue-900',
  },
  small_grid: {
    label: 'Small Grid',
    icon: LayoutGrid,
    color: 'bg-purple-100 text-purple-900',
  },
  medium_row: {
    label: 'Medium Row',
    icon: Rows3,
    color: 'bg-orange-100 text-orange-900',
  },
};

export function CollectionDisplayCard({
  display,
  collectionTitle,
  onDelete,
  onToggleActive,
  isDragging,
  dragHandleProps,
}: CollectionDisplayCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);

  const typeConfig = displayTypeConfig[display.type];
  const TypeIcon = typeConfig.icon;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/components/collection-displays/${display.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShowDeleteDialog(false);
        onDelete();
      }
    } catch (err) {
      console.error('Failed to delete collection display');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async () => {
    setIsTogglingActive(true);
    try {
      const response = await fetch(`/api/components/collection-displays/${display.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !display.isActive }),
      });

      if (response.ok) {
        onToggleActive();
      }
    } catch (err) {
      console.error('Failed to toggle collection display');
    } finally {
      setIsTogglingActive(false);
    }
  };

  return (
    <>
      <div
        className={`bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        {/* Visual Preview Header */}
        <div className="relative bg-slate-100 p-4">
          {/* Drag Handle */}
          <div
            {...dragHandleProps}
            className="absolute top-2 left-2 bg-black/50 hover:bg-black/70 rounded-lg p-1.5 cursor-grab active:cursor-grabbing transition-colors"
            title="Drag to reorder"
          >
            <GripVertical className="w-5 h-5 text-white" />
          </div>

          {/* Order Badge */}
          <div className="absolute bottom-2 right-2 bg-slate-900 text-white px-2 py-1 rounded text-xs font-semibold">
            #{display.order + 1}
          </div>

          {/* Type Visual Preview */}
          <div className="flex justify-center py-4">
            {display.type === 'large_row' && (
              <div className="flex gap-2 overflow-hidden">
                <div className="w-20 h-24 bg-slate-300 rounded flex-shrink-0 shadow-sm" />
                <div className="w-20 h-24 bg-slate-300 rounded flex-shrink-0 shadow-sm" />
                <div className="w-10 h-24 bg-slate-200 rounded flex-shrink-0 shadow-sm" />
              </div>
            )}
            {display.type === 'small_grid' && (
              <div className="grid grid-cols-2 gap-2 w-36">
                <div className="h-16 bg-slate-300 rounded shadow-sm" />
                <div className="h-16 bg-slate-300 rounded shadow-sm" />
                <div className="h-16 bg-slate-300 rounded shadow-sm" />
                <div className="h-16 bg-slate-300 rounded shadow-sm" />
              </div>
            )}
            {display.type === 'medium_row' && (
              <div className="w-48">
                <div className="flex gap-2 mb-2 overflow-hidden">
                  <div className="w-16 h-20 bg-slate-300 rounded flex-shrink-0 shadow-sm" />
                  <div className="w-16 h-20 bg-slate-300 rounded flex-shrink-0 shadow-sm" />
                  <div className="w-8 h-20 bg-slate-200 rounded flex-shrink-0 shadow-sm" />
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full">
                  <div className="h-1.5 w-1/3 bg-slate-400 rounded-full" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title and Type */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-900 line-clamp-2">
                {display.title || collectionTitle || 'Untitled Collection'}
              </h3>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                className={
                  display.isActive
                    ? 'bg-green-100 text-green-900'
                    : 'bg-slate-100 text-slate-900'
                }
              >
                {display.isActive ? 'Active' : 'Inactive'}
              </Badge>

              <Badge className={`${typeConfig.color} flex items-center gap-1`}>
                <TypeIcon className="w-3 h-3" />
                {typeConfig.label}
              </Badge>
            </div>
          </div>

          {/* Collection Info */}
          {display.title && collectionTitle && (
            <div className="text-sm text-slate-600">
              <span className="text-xs text-slate-500">Collection: </span>
              {collectionTitle}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-slate-200">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={handleToggleActive}
              disabled={isTogglingActive}
            >
              {isTogglingActive ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : display.isActive ? (
                'Deactivate'
              ) : (
                'Activate'
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="h-9 w-9 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href={`/dashboard/app-builder/collection-displays/${display.id}/edit`}>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <Pencil className="w-4 h-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="flex items-center gap-2 text-red-600 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogTitle>Delete Collection Display?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this collection display? This action cannot be undone.
          </DialogDescription>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
