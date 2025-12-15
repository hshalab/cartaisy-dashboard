/**
 * Push Notifications API Client
 *
 * Client-side API functions for managing push notifications
 * Calls backend API directly for broadcast, uses Next.js routes for read operations
 */

import { tokenStorage } from '@/lib/api/mutator/custom-instance';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cartaisy-backend-production.up.railway.app/api/v1';

export interface NotificationSegment {
  id: string;
  name: string;
  description: string;
  count: number;
}

export interface NotificationStats {
  totalCustomersWithDevices: number;
  totalActiveDevices: number;
  platformBreakdown: {
    ios: number;
    android: number;
  };
  pushEnabledCustomers: number;
  firebaseEnabled: boolean;
  topic: string;
}

export interface SendNotificationPayload {
  title: string;
  body: string;
  segment?: string;
  imageUrl?: string;
  data?: Record<string, string>;
}

export interface NotificationRecipient {
  id: string;
  name: string;
  email: string;
  deviceCount: number;
  platforms: string[];
}

export interface RecipientsResponse {
  recipients: NotificationRecipient[];
  total: number;
  page: number;
  limit: number;
}

// History types
export type NotificationStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'partial' | 'failed';

export interface NotificationHistoryItem {
  id: string;
  title: string;
  body: string;
  segment: string;
  status: NotificationStatus;
  targetCount: number;
  successCount: number;
  failureCount: number;
  deliveryRate: number;
  sentAt?: string;
  scheduledFor?: string;
  sentByEmail?: string;
  createdAt: string;
}

export interface NotificationHistoryResponse {
  notifications: NotificationHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NotificationDetail extends NotificationHistoryItem {
  data?: Record<string, string>;
  imageUrl?: string;
  failedTokens?: Array<{
    token: string;
    error: string;
    errorCode?: string;
  }>;
}

export interface HistoryFilters {
  page?: number;
  limit?: number;
  status?: string;
  segment?: string;
  startDate?: string;
  endDate?: string;
}

export const notificationApi = {
  /**
   * Get available segments with counts
   */
  async getSegments(): Promise<NotificationSegment[]> {
    const response = await fetch('/api/notifications/segments');
    if (!response.ok) {
      throw new Error('Failed to fetch segments');
    }
    const data = await response.json();
    console.log('[Notifications] Segments response:', data);
    // Handle different response formats
    const rawSegments = data.data?.segments || data.segments || [];
    // Map backend response to expected format (estimatedCount -> count)
    const segments = rawSegments.map((seg: { id: string; name: string; description?: string; count?: number; estimatedCount?: number }) => ({
      id: seg.id,
      name: seg.name,
      description: seg.description || '',
      count: seg.count ?? seg.estimatedCount ?? 0,
    }));
    return segments;
  },

  /**
   * Get notification statistics
   */
  async getStats(): Promise<NotificationStats> {
    const response = await fetch('/api/notifications/stats');
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }
    const data = await response.json();
    return data.data;
  },

  /**
   * Broadcast notification to segment
   * Calls backend API directly to ensure notifications are actually sent
   */
  async broadcast(payload: SendNotificationPayload): Promise<{ success: boolean; message: string; sentCount: number }> {
    const token = tokenStorage.getToken();
    const user = tokenStorage.getUser<{ storeId?: string }>();

    if (!token) {
      throw new Error('Not authenticated');
    }

    if (!user?.storeId) {
      throw new Error('Store ID not found. Please log out and log in again.');
    }

    console.log('[Notifications] Broadcasting to backend:', `${API_URL}/notifications/stores/${user.storeId}/broadcast`);

    const response = await fetch(`${API_URL}/notifications/stores/${user.storeId}/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Notifications] Broadcast failed:', data);
      throw new Error(data.message || 'Failed to send notification');
    }

    console.log('[Notifications] Broadcast success:', data);
    return {
      success: true,
      message: data.message || 'Notification sent successfully',
      sentCount: data.data?.sentCount || 0,
    };
  },

  /**
   * Send test notification to a specific customer
   * Calls backend API directly
   */
  async sendTest(customerId: string, title: string, body: string): Promise<{ success: boolean; message: string }> {
    const token = tokenStorage.getToken();

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/notifications/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ customerId, title, body }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send test notification');
    }

    return {
      success: true,
      message: data.message || 'Test notification sent successfully',
    };
  },

  /**
   * Get customers who can receive notifications
   */
  async getRecipients(page = 1, limit = 50): Promise<RecipientsResponse> {
    const response = await fetch(`/api/notifications/recipients?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch recipients');
    }
    const data = await response.json();
    return data.data;
  },

  /**
   * Get notification history with optional filters
   */
  async getHistory(filters: HistoryFilters = {}): Promise<NotificationHistoryResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.segment) params.append('segment', filters.segment);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await fetch(`/api/notifications/history?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch notification history');
    }
    const data = await response.json();
    return data.data || data;
  },

  /**
   * Get notification detail by ID
   */
  async getNotificationDetail(notificationId: string): Promise<NotificationDetail> {
    const response = await fetch(`/api/notifications/history/${notificationId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch notification detail');
    }
    const data = await response.json();
    return data.data || data;
  },
};
