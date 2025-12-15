'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CollectionShowcaseItem } from '@/types';
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
import { GripVertical, MoreVertical, Pencil, Trash2, Loader2, LayoutGrid, Circle } from 'lucide-react';

interface CollectionShowcaseCardProps {
  showcase: CollectionShowcaseItem;
  onDelete: () => void;
  onToggleActive: () => void;
  isDragging?: boolean;
  dragHandleProps?: any;
}

const typeConfig = {
  grid: {
    label: 'Grid',
    icon: LayoutGrid,
    color: 'bg-blue-100 text-blue-900',
  },
  circular: {
    label: 'Circular',
    icon: Circle,
    color: 'bg-purple-100 text-purple-900',
  },
};

export function CollectionShowcaseCard({
  showcase,
  onDelete,
  onToggleActive,
  isDragging,
  dragHandleProps,
}: CollectionShowcaseCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);

  const config = typeConfig[showcase.type];
  const TypeIcon = config.icon;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/components/collection-showcases/${showcase.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShowDeleteDialog(false);
        onDelete();
      }
    } catch (err) {
      console.error('Failed to delete collection showcase');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async () => {
    setIsTogglingActive(true);
    try {
      const response = await fetch(`/api/components/collection-showcases/${showcase.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !showcase.isActive }),
      });

      if (response.ok) {
        onToggleActive();
      }
    } catch (err) {
      console.error('Failed to toggle collection showcase');
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
        {/* Preview Header */}
        <div className="relative bg-slate-100 p-4">
          {/* Drag Handle */}
          <div
            {...dragHandleProps}
            className="absolute top-2 left-2 bg-black/50 hover:bg-black/70 rounded-lg p-1.5 cursor-grab active:cursor-grabbing transition-colors z-10"
            title="Drag to reorder"
          >
            <GripVertical className="w-5 h-5 text-white" />
          </div>

          {/* Position Badge */}
          <div className="absolute bottom-2 right-2 bg-slate-900 text-white px-2 py-1 rounded text-xs font-semibold z-10">
            #{showcase.position + 1}
          </div>

          {/* Type-based Preview */}
          <div className="flex justify-center py-4">
            {showcase.type === 'grid' ? (
              <div className="grid grid-cols-2 gap-1.5 w-32">
                {showcase.collections.slice(0, 4).map((collection, index) => (
                  <div
                    key={index}
                    className="aspect-[4/3] rounded overflow-hidden bg-slate-200"
                  >
                    {collection.image ? (
                      <img
                        src={collection.image}
                        alt={collection.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <LayoutGrid className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-2">
                {showcase.collections.slice(0, 4).map((collection, index) => (
                  <div
                    key={index}
                    className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm"
                  >
                    {collection.image ? (
                      <img
                        src={collection.image}
                        alt={collection.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Circle className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                  </div>
                ))}
                {showcase.collections.length > 4 && (
                  <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center">
                    <span className="text-xs text-slate-500">+{showcase.collections.length - 4}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-900 line-clamp-1">{showcase.title}</h3>
            {showcase.icon && (
              <p className="text-xs text-slate-500">Icon: {showcase.icon}</p>
            )}

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                className={
                  showcase.isActive
                    ? 'bg-green-100 text-green-900'
                    : 'bg-slate-100 text-slate-900'
                }
              >
                {showcase.isActive ? 'Active' : 'Inactive'}
              </Badge>

              <Badge className={`${config.color} flex items-center gap-1`}>
                <TypeIcon className="w-3 h-3" />
                {config.label}
              </Badge>

              <Badge className="bg-slate-100 text-slate-700">
                {showcase.collections.length} collection{showcase.collections.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          {/* Collection Titles Preview */}
          <div className="pt-2 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-1">Collections:</p>
            <div className="flex flex-wrap gap-1">
              {showcase.collections.slice(0, 3).map((collection, index) => (
                <span
                  key={index}
                  className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                >
                  {collection.title}
                </span>
              ))}
              {showcase.collections.length > 3 && (
                <span className="text-xs text-slate-500">
                  +{showcase.collections.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={handleToggleActive}
              disabled={isTogglingActive}
            >
              {isTogglingActive ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : showcase.isActive ? (
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
                <Link href={`/dashboard/app-builder/collection-showcases/${showcase.id}/edit`}>
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
          <DialogTitle>Delete Collection Showcase?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{showcase.title}"? This will remove all {showcase.collections.length} collection{showcase.collections.length !== 1 ? 's' : ''} in this showcase. This action cannot be undone.
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
