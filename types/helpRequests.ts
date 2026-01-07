export type HelpRequestStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export type HelpRequestReason =
  | 'item_damaged'
  | 'wrong_item'
  | 'order_not_received'
  | 'missing_items'
  | 'tracking_info'
  | 'other';

export interface HelpRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  reason: HelpRequestReason;
  reasonLabel: string;
  otherText: string | null;
  status: HelpRequestStatus;
  createdAt: string;
  resolvedAt: string | null;
  adminNotes: string | null;
}

export interface HelpRequestsPagination {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface HelpRequestsStatusCounts {
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
}

export interface HelpRequestsResponse {
  success: boolean;
  data: {
    helpRequests: HelpRequest[];
    pagination: HelpRequestsPagination;
    statusCounts: HelpRequestsStatusCounts;
  };
}

export interface HelpRequestDetailResponse {
  success: boolean;
  data: HelpRequest;
}

export interface HelpRequestsFilters {
  status?: HelpRequestStatus | 'all';
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface UpdateHelpRequestPayload {
  status: HelpRequestStatus;
  adminNotes?: string;
}

export const STATUS_COLORS: Record<HelpRequestStatus, { bg: string; text: string; label: string }> = {
  open: { bg: 'bg-red-100', text: 'text-red-700', label: 'Open' },
  in_progress: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'In Progress' },
  resolved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Resolved' },
  closed: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Closed' },
};

export const REASON_LABELS: Record<HelpRequestReason, string> = {
  item_damaged: 'Item damaged or defective',
  wrong_item: 'Wrong item received',
  order_not_received: 'Order not received',
  missing_items: 'Missing items in order',
  tracking_info: 'Need tracking information',
  other: 'Other',
};
