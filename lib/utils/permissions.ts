/**
 * Role-based access control helper functions
 */

export type UserRole = 'super_admin' | 'admin';

/**
 * Check if user can manage team members
 */
export function canManageTeam(role: string | undefined): boolean {
  return role === 'super_admin';
}

/**
 * Check if user can manage components (carousel, banners, etc.)
 */
export function canManageComponents(role: string | undefined): boolean {
  return role === 'super_admin' || role === 'admin';
}

/**
 * Check if user can manage store settings
 */
export function canManageSettings(role: string | undefined): boolean {
  return role === 'super_admin';
}

/**
 * Get member limit based on plan type
 */
export function getMemberLimit(planType: string | undefined): number {
  switch (planType) {
    case 'free':
      return 2;
    case 'starter':
      return 5;
    case 'pro':
      return 10;
    case 'enterprise':
      return Infinity;
    default:
      return 2; // Default to free
  }
}
