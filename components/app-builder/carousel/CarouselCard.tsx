'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CarouselItem } from '@/types';
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
import { ImagePreview } from '@/components/app-builder/ImagePreview';
import { GripVertical, MoreVertical, Pencil, Trash2, AlertCircle, Loader2 } from 'lucide-react';

interface CarouselCardProps {
  carousel: CarouselItem;
  onDelete: () => void;
  onToggleActive: () => void;
  isDragging?: boolean;
  dragHandleProps?: any;
}

export function CarouselCard({
  carousel,
  onDelete,
  onToggleActive,
  isDragging,
  dragHandleProps,
}: CarouselCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/components/carousel/${carousel.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShowDeleteDialog(false);
        onDelete();
      }
    } catch (err) {
      console.error('Failed to delete carousel');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async () => {
    if (isTogglingActive) return; // Prevent double-clicks

    setIsTogglingActive(true);
    try {
      const response = await fetch(`/api/components/carousel/${carousel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !carousel.isActive }),
      });

      if (response.ok) {
        onToggleActive();
      }
    } catch (err) {
      console.error('Failed to toggle carousel');
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
        {/* Image and Drag Handle */}
        <div className="relative">
          <ImagePreview
            imageUrl={carousel.imageUrl}
            title={carousel.title}
            className="w-full h-48"
          />

          {/* Drag Handle */}
          <div
            {...dragHandleProps}
            className="absolute top-2 left-2 bg-black/50 hover:bg-black/70 rounded-lg p-1.5 cursor-grab active:cursor-grabbing transition-colors"
            title="Drag to reorder"
          >
            <GripVertical className="w-5 h-5 text-white" />
          </div>

          {/* Position Badge */}
          <div className="absolute bottom-2 right-2 bg-slate-900 text-white px-2 py-1 rounded text-xs font-semibold">
            #{carousel.position + 1}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title and Status */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-900 line-clamp-2">{carousel.title}</h3>
              {carousel.promoTag?.text && (
                <div
                  className="text-xs font-bold px-2 py-1 rounded flex-shrink-0"
                  style={{
                    backgroundColor: carousel.promoTag.backgroundColor,
                    color: carousel.promoTag.textColor,
                  }}
                >
                  {carousel.promoTag.text}
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                className={
                  carousel.isActive
                    ? 'bg-green-100 text-green-900'
                    : 'bg-slate-100 text-slate-900'
                }
              >
                {carousel.isActive ? 'Active' : 'Inactive'}
              </Badge>

              {carousel.endsAt && (
                <Badge className="bg-blue-100 text-blue-900">
                  Ends {new Date(carousel.endsAt).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </div>

          {/* Label and CTA */}
          <div className="text-sm text-slate-600 space-y-1">
            <p className="text-xs font-medium text-slate-500 uppercase">{carousel.label}</p>
            <p className="line-clamp-1">{carousel.subtitle}</p>
          </div>

          {/* CTA Text */}
          <div className="pt-2 border-t border-slate-200">
            <p className="text-xs text-slate-500">Button: </p>
            <p className="text-sm font-medium text-slate-900">{carousel.ctaText}</p>
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
              ) : carousel.isActive ? (
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
                <Link href={`/dashboard/app-builder/carousel/${carousel.id}/edit`}>
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
          <DialogTitle>Delete Carousel?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{carousel.title}"? This action cannot be undone.
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
