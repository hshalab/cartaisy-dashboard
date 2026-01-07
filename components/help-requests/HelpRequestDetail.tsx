'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ExternalLink, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from './StatusBadge';
import type { HelpRequest, HelpRequestStatus, UpdateHelpRequestPayload } from '@/types/helpRequests';
import { REASON_LABELS } from '@/types/helpRequests';

interface HelpRequestDetailProps {
  helpRequest: HelpRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: UpdateHelpRequestPayload) => Promise<void>;
  isSaving?: boolean;
}

export function HelpRequestDetail({
  helpRequest,
  isOpen,
  onClose,
  onSave,
  isSaving = false,
}: HelpRequestDetailProps) {
  const [status, setStatus] = useState<HelpRequestStatus | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Reset state when help request changes
  const handleOpenChange = (open: boolean) => {
    if (open && helpRequest) {
      setStatus(helpRequest.status);
      setAdminNotes(helpRequest.adminNotes || '');
      setHasChanges(false);
    }
    if (!open) {
      onClose();
    }
  };

  const handleStatusChange = (newStatus: HelpRequestStatus) => {
    setStatus(newStatus);
    setHasChanges(true);
  };

  const handleNotesChange = (value: string) => {
    setAdminNotes(value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!status) return;
    await onSave({
      status,
      adminNotes: adminNotes || undefined,
    });
  };

  if (!helpRequest) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Help Request Details</span>
            <StatusBadge status={helpRequest.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Request Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Request ID</span>
              <span className="font-mono text-sm">{helpRequest.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Status</span>
              <Select
                value={status || helpRequest.status}
                onValueChange={(value) => handleStatusChange(value as HelpRequestStatus)}
              >
                <SelectTrigger className="w-[150px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200" />

          {/* Order Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-900">Order Information</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Order #</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-blue-600">{helpRequest.orderNumber}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => window.open(`/dashboard/orders/${helpRequest.orderId}`, '_blank')}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="ml-1 text-xs">View Order</span>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Customer</span>
              <span className="text-sm">{helpRequest.customerEmail}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200" />

          {/* Issue Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-900">Issue Details</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Reason</span>
              <span className="text-sm">{REASON_LABELS[helpRequest.reason] || helpRequest.reasonLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Submitted</span>
              <span className="text-sm">
                {format(new Date(helpRequest.createdAt), 'MMMM d, yyyy \'at\' h:mm a')}
              </span>
            </div>
            {helpRequest.resolvedAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Resolved</span>
                <span className="text-sm">
                  {format(new Date(helpRequest.resolvedAt), 'MMMM d, yyyy \'at\' h:mm a')}
                </span>
              </div>
            )}
          </div>

          {/* Customer's Message (only for "other" reason) */}
          {helpRequest.reason === 'other' && helpRequest.otherText && (
            <>
              <div className="border-t border-slate-200" />
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-900">Customer&apos;s Message</h4>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{helpRequest.otherText}</p>
                </div>
              </div>
            </>
          )}

          {/* Divider */}
          <div className="border-t border-slate-200" />

          {/* Admin Notes */}
          <div className="space-y-3">
            <Label htmlFor="admin-notes" className="text-sm font-medium text-slate-900">
              Admin Notes
            </Label>
            <Textarea
              id="admin-notes"
              placeholder="Add internal notes about this request..."
              value={adminNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-slate-500">
              These notes are only visible to admin users.
            </p>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
