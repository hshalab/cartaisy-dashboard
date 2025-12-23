'use client';

import { useState, useEffect } from 'react';
import { notificationApi, NotificationSegment, NotificationTemplate } from '@/lib/api/notifications';
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
import { Loader2, Send, CheckCircle, AlertCircle, Users, Type, MessageSquare, Clock, Calendar, FileText, X, Link2, ExternalLink, ShoppingBag, Home, Heart, User as UserIcon, Package, FolderOpen } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface SendNotificationFormProps {
  segments: NotificationSegment[];
  onSuccess?: () => void;
  template?: NotificationTemplate | null;
  onClearTemplate?: () => void;
}

// Deep link types supported by the backend
type DeepLinkType = 'product' | 'collection' | 'cart' | 'order' | 'orders' | 'wishlist' | 'profile' | 'home' | 'url';

const deepLinkOptions: { value: DeepLinkType; label: string; icon: React.ReactNode; needsId: boolean; needsUrl: boolean }[] = [
  { value: 'home', label: 'Home', icon: <Home className="w-4 h-4" />, needsId: false, needsUrl: false },
  { value: 'product', label: 'Product', icon: <Package className="w-4 h-4" />, needsId: true, needsUrl: false },
  { value: 'collection', label: 'Collection', icon: <FolderOpen className="w-4 h-4" />, needsId: true, needsUrl: false },
  { value: 'cart', label: 'Cart', icon: <ShoppingBag className="w-4 h-4" />, needsId: false, needsUrl: false },
  { value: 'order', label: 'Order', icon: <Package className="w-4 h-4" />, needsId: true, needsUrl: false },
  { value: 'orders', label: 'Orders List', icon: <Package className="w-4 h-4" />, needsId: false, needsUrl: false },
  { value: 'wishlist', label: 'Wishlist', icon: <Heart className="w-4 h-4" />, needsId: false, needsUrl: false },
  { value: 'profile', label: 'Profile', icon: <UserIcon className="w-4 h-4" />, needsId: false, needsUrl: false },
  { value: 'url', label: 'External URL', icon: <ExternalLink className="w-4 h-4" />, needsId: false, needsUrl: true },
];

export default function SendNotificationForm({
  segments,
  onSuccess,
  template,
  onClearTemplate,
}: SendNotificationFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Scheduling state
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // Deep link state
  const [deepLinkEnabled, setDeepLinkEnabled] = useState(false);
  const [deepLinkType, setDeepLinkType] = useState<DeepLinkType>('home');
  const [deepLinkId, setDeepLinkId] = useState('');
  const [deepLinkUrl, setDeepLinkUrl] = useState('');

  const selectedDeepLinkOption = deepLinkOptions.find(opt => opt.value === deepLinkType);

  // Pre-fill form when template is selected
  useEffect(() => {
    if (template) {
      setTitle(template.title);
      setBody(template.body);
      setImageUrl(template.image || '');
      setSelectedSegment(template.segment);
    }
  }, [template]);

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

    // Validate scheduling
    if (scheduleEnabled) {
      if (!scheduledDate) {
        errors.scheduledDate = 'Date is required for scheduling';
      }
      if (!scheduledTime) {
        errors.scheduledTime = 'Time is required for scheduling';
      }
      if (scheduledDate && scheduledTime) {
        const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
        if (scheduledDateTime <= new Date()) {
          errors.scheduledDate = 'Scheduled time must be in the future';
        }
      }
    }

    // Validate deep link
    if (deepLinkEnabled) {
      if (selectedDeepLinkOption?.needsId && !deepLinkId.trim()) {
        errors.deepLinkId = `${deepLinkType.charAt(0).toUpperCase() + deepLinkType.slice(1)} ID is required`;
      }
      if (selectedDeepLinkOption?.needsUrl) {
        if (!deepLinkUrl.trim()) {
          errors.deepLinkUrl = 'URL is required';
        } else if (!/^https?:\/\/.+/.test(deepLinkUrl.trim())) {
          errors.deepLinkUrl = 'Please enter a valid URL starting with http:// or https://';
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isScheduled = scheduleEnabled && scheduledDate && scheduledTime;

    console.log('📤 [DASHBOARD] Step 1: Send button clicked');
    console.log('📤 [DASHBOARD] Step 1a: Form data:', {
      title: title.trim(),
      body: body.trim(),
      segment: selectedSegment,
      imageUrl: imageUrl.trim() || undefined,
      scheduledFor: isScheduled ? `${scheduledDate}T${scheduledTime}` : undefined,
    });

    if (!validate()) {
      console.log('❌ [DASHBOARD] Validation failed:', validationErrors);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess(false);
      setSuccessMessage('');

      console.log('📤 [DASHBOARD] Step 2: Calling notificationApi.broadcast()');

      const payload: Parameters<typeof notificationApi.broadcast>[0] = {
        title: title.trim(),
        body: body.trim(),
        segment: selectedSegment,
        imageUrl: imageUrl.trim() || undefined,
      };

      // Add scheduling if enabled
      if (isScheduled) {
        const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
        payload.scheduledFor = scheduledDateTime.toISOString();
      }

      // Add deep link if enabled
      if (deepLinkEnabled) {
        payload.deepLink = {
          type: deepLinkType,
          ...(selectedDeepLinkOption?.needsId && { id: deepLinkId.trim() }),
          ...(deepLinkType === 'url' && { url: deepLinkUrl.trim() }),
        };
      }

      const result = await notificationApi.broadcast(payload);

      console.log('✅ [DASHBOARD] Step 3: Broadcast result:', result);

      setSuccess(true);
      if (isScheduled) {
        const formattedDate = format(new Date(`${scheduledDate}T${scheduledTime}`), 'MMM d, yyyy \'at\' h:mm a');
        setSuccessMessage(`Notification scheduled for ${formattedDate}`);
      } else {
        setSuccessMessage(`Delivered to ${recipientCount.toLocaleString()} customers`);
      }

      // Reset form
      setTitle('');
      setBody('');
      setImageUrl('');
      setScheduleEnabled(false);
      setScheduledDate('');
      setScheduledTime('');
      setDeepLinkEnabled(false);
      setDeepLinkType('home');
      setDeepLinkId('');
      setDeepLinkUrl('');
      setValidationErrors({});
      onSuccess?.();

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('❌ [DASHBOARD] Broadcast error:', err);
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
            <p className="font-medium text-emerald-900">
              {successMessage.includes('scheduled') ? 'Notification scheduled!' : 'Notification sent successfully!'}
            </p>
            <p className="text-sm text-emerald-700">{successMessage}</p>
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

      {/* Template Indicator */}
      {template && onClearTemplate && (
        <div className="flex items-center justify-between bg-violet-50 border border-violet-200 p-4 rounded-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="font-medium text-violet-900">Using template</p>
              <p className="text-sm text-violet-700">{template.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClearTemplate}
            className="p-2 text-violet-400 hover:text-violet-600 rounded-lg hover:bg-violet-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
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

      {/* Image Upload */}
      <ImageUploader
        value={imageUrl}
        onChange={setImageUrl}
        onClear={() => setImageUrl('')}
      />

      {/* Deep Link Option */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <input
            type="checkbox"
            id="deepLink"
            checked={deepLinkEnabled}
            onChange={(e) => {
              setDeepLinkEnabled(e.target.checked);
              if (!e.target.checked) {
                setDeepLinkType('home');
                setDeepLinkId('');
                setDeepLinkUrl('');
              }
            }}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="deepLink" className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
            <Link2 className="w-4 h-4 text-slate-500" />
            Add Deep Link
          </label>
          <span className="text-xs text-slate-400 ml-auto">Opens specific screen when tapped</span>
        </div>

        {deepLinkEnabled && (
          <div className="space-y-4 pl-4 animate-in fade-in slide-in-from-top-2">
            {/* Link Type Selector */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Link2 className="w-4 h-4 text-slate-500" />
                Link Type
              </Label>
              <Select value={deepLinkType} onValueChange={(value) => {
                setDeepLinkType(value as DeepLinkType);
                setDeepLinkId('');
                setDeepLinkUrl('');
              }}>
                <SelectTrigger className="h-12 bg-slate-50 border-slate-200 hover:bg-slate-100 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {deepLinkOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="py-3">
                      <div className="flex items-center gap-2">
                        {option.icon}
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ID Input - for product, collection, order */}
            {selectedDeepLinkOption?.needsId && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  {selectedDeepLinkOption.icon}
                  {deepLinkType === 'product' && 'Product ID'}
                  {deepLinkType === 'collection' && 'Collection ID'}
                  {deepLinkType === 'order' && 'Order ID'}
                </Label>
                <Input
                  placeholder={`Enter ${deepLinkType} ID...`}
                  value={deepLinkId}
                  onChange={(e) => setDeepLinkId(e.target.value)}
                  className={cn(
                    'h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors',
                    validationErrors.deepLinkId && 'border-red-500 focus:ring-red-500'
                  )}
                />
                {validationErrors.deepLinkId && (
                  <p className="text-xs text-red-600">{validationErrors.deepLinkId}</p>
                )}
                <p className="text-xs text-slate-400">
                  {deepLinkType === 'product' && 'The Shopify product ID (e.g., 7654321098765)'}
                  {deepLinkType === 'collection' && 'The collection ID from your store'}
                  {deepLinkType === 'order' && 'The order ID to show'}
                </p>
              </div>
            )}

            {/* URL Input - for external URL */}
            {selectedDeepLinkOption?.needsUrl && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <ExternalLink className="w-4 h-4 text-slate-500" />
                  URL
                </Label>
                <Input
                  placeholder="https://example.com/page"
                  value={deepLinkUrl}
                  onChange={(e) => setDeepLinkUrl(e.target.value)}
                  type="url"
                  className={cn(
                    'h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors',
                    validationErrors.deepLinkUrl && 'border-red-500 focus:ring-red-500'
                  )}
                />
                {validationErrors.deepLinkUrl && (
                  <p className="text-xs text-red-600">{validationErrors.deepLinkUrl}</p>
                )}
                <p className="text-xs text-slate-400">External URL to open in the app browser</p>
              </div>
            )}

            {/* Info for types that don't need additional input */}
            {!selectedDeepLinkOption?.needsId && !selectedDeepLinkOption?.needsUrl && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                {selectedDeepLinkOption?.icon}
                <span>Tapping the notification will open the <strong>{selectedDeepLinkOption?.label}</strong> screen</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Schedule Option */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <input
            type="checkbox"
            id="schedule"
            checked={scheduleEnabled}
            onChange={(e) => {
              setScheduleEnabled(e.target.checked);
              if (!e.target.checked) {
                setScheduledDate('');
                setScheduledTime('');
              }
            }}
            className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
          />
          <label htmlFor="schedule" className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
            <Clock className="w-4 h-4 text-slate-500" />
            Schedule for later
          </label>
        </div>

        {scheduleEnabled && (
          <div className="grid grid-cols-2 gap-4 pl-4 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Calendar className="w-4 h-4 text-slate-500" />
                Date
              </Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className={cn(
                  'h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors',
                  validationErrors.scheduledDate && 'border-red-500 focus:ring-red-500'
                )}
              />
              {validationErrors.scheduledDate && (
                <p className="text-xs text-red-600">{validationErrors.scheduledDate}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Clock className="w-4 h-4 text-slate-500" />
                Time
              </Label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className={cn(
                  'h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors',
                  validationErrors.scheduledTime && 'border-red-500 focus:ring-red-500'
                )}
              />
              {validationErrors.scheduledTime && (
                <p className="text-xs text-red-600">{validationErrors.scheduledTime}</p>
              )}
            </div>
          </div>
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
            'h-12 px-8 text-white shadow-lg transition-all',
            scheduleEnabled
              ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-violet-500/25'
              : 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-blue-500/25',
            (loading || recipientCount === 0) && 'opacity-50 cursor-not-allowed shadow-none'
          )}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {scheduleEnabled ? 'Scheduling...' : 'Sending...'}
            </>
          ) : scheduleEnabled ? (
            <>
              <Clock className="mr-2 h-5 w-5" />
              Schedule Notification
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Send Now
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
