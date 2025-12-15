'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, Trash2 } from 'lucide-react';

interface DeleteStoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeName: string;
}

export function DeleteStoreDialog({ open, onOpenChange, storeName }: DeleteStoreDialogProps) {
  const [confirmName, setConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const isConfirmed = confirmName === storeName;

  const handleDelete = async () => {
    if (!isConfirmed) return;

    setError('');
    setIsDeleting(true);

    try {
      const response = await fetch('/api/store', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to delete store');
        return;
      }

      // Redirect to login after deletion
      window.location.href = '/login';
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setConfirmName('');
      setError('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-red-600 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Delete Store
        </DialogTitle>
        <DialogDescription>
          This action cannot be undone. This will permanently delete your store and all associated data.
        </DialogDescription>

        <div className="space-y-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-900 font-medium">Warning</p>
            <p className="text-sm text-red-700 mt-1">
              Deleting your store will:
            </p>
            <ul className="text-sm text-red-700 mt-2 ml-4 list-disc space-y-1">
              <li>Remove all team members and invitations</li>
              <li>Delete all components and configurations</li>
              <li>Disconnect Shopify integration</li>
              <li>Remove all store data permanently</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeName" className="text-sm font-medium">
              To confirm, type the store name: <span className="font-mono text-red-600">{storeName}</span>
            </Label>
            <Input
              id="storeName"
              placeholder="Enter store name to confirm"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              disabled={isDeleting}
              className="font-mono"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!isConfirmed || isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Store
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
