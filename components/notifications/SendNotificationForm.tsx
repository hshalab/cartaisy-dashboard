'use client';

import { useState } from 'react';
import { notificationApi, NotificationSegment } from '@/lib/api/notifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Send, CheckCircle, AlertCircle, Users, ImageIcon, Type, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SendNotificationFormProps {
  segments: NotificationSegment[];
  onSuccess?: () => void;
}

export default function SendNotificationForm({
  segments,
  onSuccess,
}: SendNotificationFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const selectedSegmentData = segments.find(s => s.id === selectedSegment);
  const recipientCount = selectedSegmentData?.count || 0;

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = 'Title is required';
    } else if (title.length > 100) {
      errors.title = 'Title must be 100 characters or less';
    }

    if (!body.trim()) {
      errors.body = 'Message is required';
    } else if (body.length > 500) {
      errors.body = 'Message must be 500 characters or less';
    }

    if (imageUrl && !isValidUrl(imageUrl)) {
      errors.imageUrl = 'Please enter a valid URL';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      await notificationApi.broadcast({
        title: title.trim(),
        body: body.trim(),
        segment: selectedSegment,
        imageUrl: imageUrl.trim() || undefined,
      });

      setSuccess(true);
      setTitle('');
      setBody('');
      setImageUrl('');
      setValidationErrors({});
      onSuccess?.();

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-in fade-in slide-in-from-top-2">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-medium text-emerald-900">Notification sent successfully!</p>
            <p className="text-sm text-emerald-700">
              Delivered to {recipientCount.toLocaleString()} customers
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl animate-in fade-in slide-in-from-top-2">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-red-900">Failed to send</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Segment Selector */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Users className="w-4 h-4 text-slate-500" />
          Target Audience
        </Label>
        <Select value={selectedSegment} onValueChange={setSelectedSegment}>
          <SelectTrigger className="h-12 bg-slate-50 border-slate-200 hover:bg-slate-100 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {segments.map((segment) => (
              <SelectItem key={segment.id} value={segment.id} className="py-3">
                <div className="flex items-center justify-between w-full gap-4">
                  <span>{segment.name}</span>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {(segment.count ?? 0).toLocaleString()} customers
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedSegmentData && (
          <p className="text-xs text-slate-500 pl-6">{selectedSegmentData.description}</p>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Type className="w-4 h-4 text-slate-500" />
          Notification Title
        </Label>
        <Input
          placeholder="e.g., Flash Sale - 50% Off Today Only!"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          className={cn(
            'h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors',
            validationErrors.title && 'border-red-500 focus:ring-red-500'
          )}
        />
        <div className="flex justify-between items-center">
          {validationErrors.title ? (
            <p className="text-xs text-red-600">{validationErrors.title}</p>
          ) : (
            <span />
          )}
          <p className={cn('text-xs', title.length > 80 ? 'text-amber-600' : 'text-slate-400')}>
            {title.length}/100
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <MessageSquare className="w-4 h-4 text-slate-500" />
          Message
        </Label>
        <Textarea
          placeholder="Write a compelling message that will engage your customers..."
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={500}
          className={cn(
            'bg-slate-50 border-slate-200 focus:bg-white transition-colors resize-none',
            validationErrors.body && 'border-red-500 focus:ring-red-500'
          )}
        />
        <div className="flex justify-between items-center">
          {validationErrors.body ? (
            <p className="text-xs text-red-600">{validationErrors.body}</p>
          ) : (
            <span />
          )}
          <p className={cn('text-xs', body.length > 400 ? 'text-amber-600' : 'text-slate-400')}>
            {body.length}/500
          </p>
        </div>
      </div>

      {/* Image URL (Optional) */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <ImageIcon className="w-4 h-4 text-slate-500" />
          Image URL
          <span className="text-xs text-slate-400 font-normal">(Optional)</span>
        </Label>
        <Input
          type="url"
          placeholder="https://example.com/promo-image.jpg"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className={cn(
            'h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors',
            validationErrors.imageUrl && 'border-red-500 focus:ring-red-500'
          )}
        />
        {validationErrors.imageUrl ? (
          <p className="text-xs text-red-600">{validationErrors.imageUrl}</p>
        ) : (
          <p className="text-xs text-slate-500 pl-6">
            Add an image to make your notification more engaging
          </p>
        )}
      </div>

      {/* Preview Card */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Preview</p>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 truncate">
                {title || 'Notification Title'}
              </p>
              <p className="text-sm text-slate-600 mt-0.5 line-clamp-2">
                {body || 'Your message will appear here...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recipient Count & Submit */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{recipientCount.toLocaleString()}</p>
            <p className="text-sm text-slate-500">Recipients</p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || recipientCount === 0}
          size="lg"
          className={cn(
            'h-12 px-8 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-lg shadow-blue-500/25 transition-all',
            (loading || recipientCount === 0) && 'opacity-50 cursor-not-allowed shadow-none'
          )}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Send Notification
            </>
          )}
        </Button>
      </div>

      {recipientCount === 0 && (
        <p className="text-sm text-center text-amber-600 bg-amber-50 p-3 rounded-lg">
          No customers available in this segment. Select a different audience to send notifications.
        </p>
      )}
    </form>
  );
}
