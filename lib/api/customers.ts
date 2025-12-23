/**
 * Customers API Client
 *
 * Client-side API functions for managing customers
 */

import { tokenStorage } from '@/lib/api/mutator/custom-instance';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cartaisy-backend-production.up.railway.app/api/v1';
const ADMIN_API_URL = `${API_URL}/admin`;

export interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  /** Currency code for totalSpent (e.g., 'USD', 'EUR') */
  currency?: string;
  lastOrderDate?: string;
  createdAt: string;
  updatedAt: string;
  acceptsMarketing: boolean;
  tags?: string[];
  defaultAddress?: CustomerAddress;
  deviceCount?: number;
  platforms?: string[];
}

export interface CustomerAddress {
  id: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  provinceCode?: string;
  country?: string;
  countryCode?: string;
  zip?: string;
  phone?: string;
  isDefault: boolean;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  totalPrice: number;
  subtotalPrice: number;
  totalTax: number;
  currency: string;
  financialStatus: string;
  fulfillmentStatus: string;
  itemCount: number;
  createdAt: string;
  processedAt?: string;
  paymentMethod?: string;    // apple_pay | google_pay | card | link | other
  paymentGateway?: string;   // stripe | shopify | paypal | cash | other
  paymentStatus?: string;    // pending | paid | failed | refunded
}

export interface CustomerActivity {
  id: string;
  type: 'product_view' | 'search' | 'add_to_cart' | 'checkout' | 'order' | 'notification';
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface CustomerDetail extends Customer {
  addresses: CustomerAddress[];
  orders: CustomerOrder[];
  recentActivity: CustomerActivity[];
  metrics: {
    averageOrderValue: number;
    daysSinceLastOrder?: number;
    lifetimeValue: number;
  };
}

export interface CustomersListResponse {
  customers: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CustomersFilters {
  page?: number;
  limit?: number;
  search?: string;
  filter?: 'all' | 'has_orders' | 'no_orders' | 'high_value';
  sortBy?: 'name' | 'email' | 'orders' | 'spent' | 'lastOrder' | 'joined';
  sortOrder?: 'asc' | 'desc';
}

export const customersApi = {
  /**
   * Get paginated list of customers with filters
   */
  async getCustomers(filters: CustomersFilters = {}): Promise<CustomersListResponse> {
    const token = tokenStorage.getToken();
    const user = tokenStorage.getUser<{ storeId?: string }>();

    if (!token) {
      throw new Error('Not authenticated');
    }

    if (!user?.storeId) {
      throw new Error('Store ID not found');
    }

    const params = new URLSearchParams();
    const limit = filters.limit || 20;
    const page = filters.page || 1;
    const offset = (page - 1) * limit;

    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.filter && filters.filter !== 'all') params.append('filter', filters.filter);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await fetch(
      `${ADMIN_API_URL}/stores/${user.storeId}/customers?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch customers');
    }

    const data = await response.json();
    const rawCustomers = data.data?.customers || [];
    const pagination = data.data?.pagination || { total: 0, limit: 20, page: 1, totalPages: 0 };

    // Map backend response to frontend format
    const customers: Customer[] = rawCustomers.map((c: Record<string, unknown>) => {
      // Handle both old (name) and new (firstName/lastName) formats
      let firstName = c.firstName as string | undefined;
      let lastName = c.lastName as string | undefined;
      if (!firstName && c.name) {
        firstName = ((c.name as string) || '').split(' ')[0] || '';
        lastName = ((c.name as string) || '').split(' ').slice(1).join(' ') || '';
      }

      return {
        id: c.id as string,
        email: c.email as string,
        firstName: firstName || '',
        lastName: lastName || '',
        phone: c.phone as string | undefined,
        totalOrders: (c.totalOrders as number) || (c.orderCount as number) || 0,
        totalSpent: (c.totalSpent as number) || 0,
        currency: c.currency as string | undefined,
        lastOrderDate: c.lastOrderDate as string | undefined,
        createdAt: c.createdAt as string,
        updatedAt: (c.updatedAt as string) || (c.createdAt as string),
        acceptsMarketing: (c.acceptsMarketing as boolean) || false,
        tags: c.tags as string[] | undefined,
        defaultAddress: c.defaultAddress as CustomerAddress | undefined,
        deviceCount: c.deviceCount as number | undefined,
        platforms: (c.platforms as string[]) || (c.platform ? [c.platform as string] : []),
      };
    });

    return {
      customers,
      pagination: {
        page: pagination.page || page,
        limit: pagination.limit || limit,
        total: pagination.total || 0,
        totalPages: pagination.totalPages || Math.ceil((pagination.total || 0) / limit),
      },
    };
  },

  /**
   * Get detailed customer information
   */
  async getCustomer(customerId: string): Promise<CustomerDetail> {
    const token = tokenStorage.getToken();
    const user = tokenStorage.getUser<{ storeId?: string }>();

    if (!token) {
      throw new Error('Not authenticated');
    }

    if (!user?.storeId) {
      throw new Error('Store ID not found');
    }

    const response = await fetch(
      `${ADMIN_API_URL}/stores/${user.storeId}/customers/${customerId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch customer details');
    }

    const json = await response.json();
    const data = json.data;

    // Map orders to frontend format
    const orders: CustomerOrder[] = (data.orders || []).map((o: Record<string, unknown>) => ({
      id: o.id as string,
      orderNumber: o.orderNumber as string,
      totalPrice: (o.totalPrice as number) || (o.total as number) || 0,
      subtotalPrice: (o.subtotalPrice as number) || (o.total as number) || 0,
      totalTax: (o.totalTax as number) || 0,
      currency: (o.currency as string) || 'USD',
      financialStatus: (o.paymentStatus as string) || (o.financialStatus as string) || (o.status as string) || 'pending',
      fulfillmentStatus: (o.fulfillmentStatus as string) || 'unfulfilled',
      itemCount: (o.itemCount as number) || 0,
      createdAt: o.createdAt as string,
      processedAt: o.processedAt as string | undefined,
      paymentMethod: o.paymentMethod as string | undefined,
      paymentGateway: o.paymentGateway as string | undefined,
      paymentStatus: o.paymentStatus as string | undefined,
    }));

    // Calculate totals from orders if backend returns 0
    const calculatedTotalOrders = orders.length;
    const calculatedTotalSpent = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const calculatedAvgOrderValue = calculatedTotalOrders > 0 ? calculatedTotalSpent / calculatedTotalOrders : 0;

    // Find the most recent order date
    const sortedOrders = [...orders].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const lastOrderDate = sortedOrders[0]?.createdAt || data.lastOrderDate;

    return {
      ...data,
      totalOrders: data.totalOrders || calculatedTotalOrders,
      totalSpent: data.totalSpent || calculatedTotalSpent,
      lastOrderDate: lastOrderDate,
      orders,
      recentActivity: data.recentActivity || [],
      metrics: {
        averageOrderValue: data.metrics?.averageOrderValue || calculatedAvgOrderValue,
        daysSinceLastOrder: data.metrics?.daysSinceLastOrder,
        lifetimeValue: data.metrics?.lifetimeValue || calculatedTotalSpent,
      },
    };
  },

  /**
   * Get customer orders
   */
  async getCustomerOrders(
    customerId: string,
    page = 1,
    limit = 10
  ): Promise<{ orders: CustomerOrder[]; total: number }> {
    const token = tokenStorage.getToken();
    const user = tokenStorage.getUser<{ storeId?: string }>();

    if (!token) {
      throw new Error('Not authenticated');
    }

    if (!user?.storeId) {
      throw new Error('Store ID not found');
    }

    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await fetch(
      `${ADMIN_API_URL}/stores/${user.storeId}/customers/${customerId}/orders?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch customer orders');
    }

    const data = await response.json();
    const rawOrders = data.data?.orders || [];

    // Map backend response to frontend format
    const orders: CustomerOrder[] = rawOrders.map((o: Record<string, unknown>) => ({
      id: o.id as string,
      orderNumber: o.orderNumber as string,
      totalPrice: (o.totalPrice as number) || (o.total as number) || 0,
      subtotalPrice: (o.subtotalPrice as number) || (o.total as number) || 0,
      totalTax: (o.totalTax as number) || 0,
      currency: (o.currency as string) || 'USD',
      financialStatus: (o.paymentStatus as string) || (o.financialStatus as string) || (o.status as string) || 'pending',
      fulfillmentStatus: (o.fulfillmentStatus as string) || 'unfulfilled',
      itemCount: (o.itemCount as number) || 0,
      createdAt: o.createdAt as string,
      processedAt: o.processedAt as string | undefined,
      paymentMethod: o.paymentMethod as string | undefined,
      paymentGateway: o.paymentGateway as string | undefined,
      paymentStatus: o.paymentStatus as string | undefined,
    }));

    return { orders, total: data.data?.total || 0 };
  },

  /**
   * Get customer activity
   */
  async getCustomerActivity(
    customerId: string,
    limit = 20
  ): Promise<{ activities: CustomerActivity[]; total: number }> {
    const token = tokenStorage.getToken();
    const user = tokenStorage.getUser<{ storeId?: string }>();

    if (!token) {
      throw new Error('Not authenticated');
    }

    if (!user?.storeId) {
      throw new Error('Store ID not found');
    }

    const response = await fetch(
      `${ADMIN_API_URL}/stores/${user.storeId}/customers/${customerId}/activity?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch customer activity');
    }

    const data = await response.json();
    return data.data || { activities: [], total: 0 };
  },

  /**
   * Get customer statistics summary
   */
  async getCustomerStats(): Promise<{
    totalCustomers: number;
    customersWithOrders: number;
    customersWithoutOrders: number;
    highValueCustomers: number;
    newCustomersThisMonth: number;
  }> {
    const defaultStats = {
      totalCustomers: 0,
      customersWithOrders: 0,
      customersWithoutOrders: 0,
      highValueCustomers: 0,
      newCustomersThisMonth: 0,
    };

    const token = tokenStorage.getToken();
    const user = tokenStorage.getUser<{ storeId?: string }>();

    if (!token || !user?.storeId) {
      return defaultStats;
    }

    try {
      const response = await fetch(
        `${ADMIN_API_URL}/stores/${user.storeId}/customers/stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const stats = data.data;
        if (stats) {
          // Handle both old (overview nested) and new (flat) formats
          const overview = stats.overview || stats;
          return {
            totalCustomers: overview.totalCustomers || 0,
            customersWithOrders: overview.customersWithOrders || overview.withOrders || 0,
            customersWithoutOrders: overview.customersWithoutOrders || ((overview.totalCustomers || 0) - (overview.withOrders || 0)),
            highValueCustomers: overview.highValueCustomers || 0,
            newCustomersThisMonth: overview.newCustomersThisMonth || overview.newThisMonth || 0,
          };
        }
      }

      return defaultStats;
    } catch {
      return defaultStats;
    }
  },
};
