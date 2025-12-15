import { headers } from 'next/headers';
import { getServerSession, authConfig } from '@/lib/auth/server';
import { logActivity, ActivityInput } from '@/lib/services/activity';
import { IActivity } from '@/models/Activity';

export interface ActivityLogInput {
  action: ActivityInput['action'];
  resourceType: IActivity['resourceType'];
  resourceId: string;
  resourceName?: string;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  metadata?: Record<string, any>;
}

/**
 * Helper function to log activity with automatic session and request info extraction
 * Should be called from API routes after successful operations
 */
export async function logActivityFromRequest(input: ActivityLogInput): Promise<void> {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.storeId || !session?.user?.id) {
      console.warn('Activity logging skipped: No valid session');
      return;
    }

    // Get request headers for IP and user agent
    const headersList = await headers();
    const ipAddress =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headersList.get('x-real-ip') ||
      undefined;
    const userAgent = headersList.get('user-agent') || undefined;

    // Sanitize changes to remove sensitive data
    const sanitizedChanges = input.changes
      ? sanitizeChanges(input.changes)
      : undefined;

    await logActivity({
      storeId: session.user.storeId,
      userId: session.user.id,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      resourceName: input.resourceName,
      changes: sanitizedChanges,
      metadata: input.metadata,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    // Log error but don't throw - activity logging should not break main operations
    console.error('Failed to log activity:', error);
  }
}

/**
 * Sanitize changes object to remove sensitive data
 */
function sanitizeChanges(changes: {
  before?: Record<string, any>;
  after?: Record<string, any>;
}): { before?: Record<string, any>; after?: Record<string, any> } {
  const sensitiveFields = [
    'password',
    'passwordHash',
    'token',
    'accessToken',
    'refreshToken',
    'secret',
    'apiKey',
    'inviteToken',
    'shopifyAccessToken',
  ];

  const sanitize = (obj: Record<string, any> | undefined): Record<string, any> | undefined => {
    if (!obj) return undefined;

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  return {
    before: sanitize(changes.before),
    after: sanitize(changes.after),
  };
}

/**
 * Helper to create a changes object from before and after values
 */
export function createChangesObject(
  before: Record<string, any> | null,
  after: Record<string, any>,
  fieldsToTrack?: string[]
): { before?: Record<string, any>; after?: Record<string, any> } | undefined {
  if (!before) {
    return { after };
  }

  const changes: { before: Record<string, any>; after: Record<string, any> } = {
    before: {},
    after: {},
  };

  const fields = fieldsToTrack || Object.keys(after);
  let hasChanges = false;

  for (const field of fields) {
    const beforeVal = before[field];
    const afterVal = after[field];

    // Skip if values are the same
    if (JSON.stringify(beforeVal) === JSON.stringify(afterVal)) {
      continue;
    }

    changes.before[field] = beforeVal;
    changes.after[field] = afterVal;
    hasChanges = true;
  }

  return hasChanges ? changes : undefined;
}

/**
 * Format resource type for display
 */
export function formatResourceType(resourceType: string): string {
  const typeMap: Record<string, string> = {
    carousel: 'Carousel',
    category_grid: 'Category Grid',
    callout_banner: 'Callout Banner',
    collection_display: 'Collection Display',
    promo_banner: 'Promo Banner',
    category_collection_grid: 'Category Collection Grid',
    collection_showcase: 'Collection Showcase',
    store_settings: 'Store Settings',
    team_member: 'Team Member',
    shopify_connection: 'Shopify Connection',
  };
  return typeMap[resourceType] || resourceType;
}

/**
 * Get URL for resource based on type
 */
export function getResourceUrl(resourceType: string, resourceId: string): string | null {
  const urlMap: Record<string, string> = {
    carousel: `/dashboard/app-builder/carousel/${resourceId}/edit`,
    category_grid: `/dashboard/app-builder/category-grid/${resourceId}/edit`,
    callout_banner: `/dashboard/app-builder/callout-banners/${resourceId}/edit`,
    collection_display: `/dashboard/app-builder/collection-displays/${resourceId}/edit`,
    promo_banner: `/dashboard/app-builder/promo-banners/${resourceId}/edit`,
    category_collection_grid: `/dashboard/app-builder/category-collection-grid/${resourceId}/edit`,
    collection_showcase: `/dashboard/app-builder/collection-showcases/${resourceId}/edit`,
    store_settings: '/dashboard/settings',
    team_member: '/dashboard/team',
  };
  return urlMap[resourceType] || null;
}
