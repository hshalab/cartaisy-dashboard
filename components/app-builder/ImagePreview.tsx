'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AlertCircle, ImageOff, Loader2 } from 'lucide-react';

interface ImagePreviewProps {
  imageUrl?: string;
  title?: string;
  className?: string;
}

export function ImagePreview({
  imageUrl,
  title = 'Image preview',
  className = 'w-full h-48',
}: ImagePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!imageUrl) {
    return (
      <div className={`${className} bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300`}>
        <div className="text-center">
          <ImageOff className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600">No image</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative bg-slate-100 rounded-lg overflow-hidden border border-slate-200`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-xs text-red-600">Image failed to load</p>
          </div>
        </div>
      )}

      {!hasError && (
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      )}
    </div>
  );
}
