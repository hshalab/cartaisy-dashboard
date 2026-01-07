/**
 * Help Requests API Client
 *
 * Client-side API functions for managing help requests
 */

import { tokenStorage } from '@/lib/api/mutator/custom-instance';
import type {
  HelpRequest,
  HelpRequestsResponse,
  HelpRequestDetailResponse,
  HelpRequestsFilters,
  UpdateHelpRequestPayload,
  HelpRequestsStatusCounts,
  HelpRequestsPagination,
} from '@/types/helpRequests';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cartaisy-backend-production.up.railway.app/api/v1';
const ADMIN_API_URL = `${API_URL}/admin`;

export interface HelpRequestsListResponse {
  helpRequests: HelpRequest[];
  pagination: HelpRequestsPagination;
  statusCounts: HelpRequestsStatusCounts;
}

export const helpRequestsApi = {
  /**
   * Get paginated list of help requests with filters
   */
  async getHelpRequests(filters: HelpRequestsFilters = {}): Promise<HelpRequestsListResponse> {
    const token = tokenStorage.getToken();

    if (!token) {
      throw new Error('Not authenticated');
    }

    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.search) params.append('search', filters.search);

    const response = await fetch(
      `${ADMIN_API_URL}/help-requests?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch help requests');
    }

    const data: HelpRequestsResponse = await response.json();

    return {
      helpRequests: data.data.helpRequests,
      pagination: data.data.pagination,
      statusCounts: data.data.statusCounts,
    };
  },

  /**
   * Get single help request details
   */
  async getHelpRequest(orderId: string, helpRequestId: string): Promise<HelpRequest> {
    const token = tokenStorage.getToken();

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${ADMIN_API_URL}/help-requests/${orderId}/${helpRequestId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch help request details');
    }

    const data: HelpRequestDetailResponse = await response.json();
    return data.data;
  },

  /**
   * Update help request status and/or admin notes
   */
  async updateHelpRequest(
    orderId: string,
    helpRequestId: string,
    payload: UpdateHelpRequestPayload
  ): Promise<HelpRequest> {
    const token = tokenStorage.getToken();

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${ADMIN_API_URL}/help-requests/${orderId}/${helpRequestId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update help request');
    }

    const data: HelpRequestDetailResponse = await response.json();
    return data.data;
  },
};
