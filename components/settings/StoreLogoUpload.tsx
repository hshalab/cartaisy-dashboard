'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';

interface StoreLogoUploadProps {
  currentLogo?: string | null;
  storeName?: string;
  onLogoChange?: (logoUrl: string | null) => void;
}

export function StoreLogoUpload({ currentLogo, storeName = 'Store', onLogoChange }: StoreLogoUploadProps) {
  const [logo, setLogo] = useState<string | null>(currentLogo || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storeInitial = storeName.charAt(0).toUpperCase();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG, or WebP image');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // For now, create a local preview URL
      // When backend is ready, this will upload to server
      const previewUrl = URL.createObjectURL(file);
      setLogo(previewUrl);
      onLogoChange?.(previewUrl);

      // TODO: When backend is ready, uncomment this:
      // const formData = new FormData();
      // formData.append('logo', file);
      // const response = await fetch('/api/store/upload-logo', {
      //   method: 'POST',
      //   body: formData,
      // });
      // if (response.ok) {
      //   const data = await response.json();
      //   setLogo(data.logoUrl);
      //   onLogoChange?.(data.logoUrl);
      // } else {
      //   throw new Error('Upload failed');
      // }

    } catch {
      setError('Failed to upload logo. Please try again.');
      setLogo(currentLogo || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    setIsUploading(true);
    try {
      // TODO: When backend is ready, call delete API
      // await fetch('/api/store/logo', { method: 'DELETE' });

      setLogo(null);
      onLogoChange?.(null);
    } catch {
      setError('Failed to remove logo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col sm:flex-row sm:items-start gap-5">
        {/* Logo Preview */}
        <div className="shrink-0">
          <div className="relative group">
            {logo ? (
              <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-50">
                <img
                  src={logo}
                  alt="Store logo"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                <span className="text-2xl font-bold text-slate-400">{storeInitial}</span>
              </div>
            )}

            {/* Remove button overlay */}
            {logo && !isUploading && (
              <button
                onClick={handleRemoveLogo}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Loading overlay */}
            {isUploading && (
              <div className="absolute inset-0 rounded-xl bg-white/80 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
              </div>
            )}
          </div>
        </div>

        {/* Info and Upload Button */}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-slate-900 mb-1">Store Logo</h3>
          <p className="text-xs text-slate-500 mb-3">
            Upload your store logo. This will appear in the sidebar and app header.
            Recommended: Square image, at least 200x200 pixels.
          </p>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              {logo ? 'Change Logo' : 'Upload Logo'}
            </Button>

            {logo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveLogo}
                disabled={isUploading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Remove
              </Button>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Error message */}
          {error && (
            <p className="text-xs text-red-600 mt-2">{error}</p>
          )}

          {/* File requirements */}
          <p className="text-xs text-slate-400 mt-2">
            JPG, PNG or WebP. Max 2MB.
          </p>
        </div>
      </div>
    </div>
  );
}
