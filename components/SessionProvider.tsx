'use client';

import { AuthProvider } from '@/lib/auth';
import { ReactNode } from 'react';

/**
 * Session Provider
 *
 * Wraps children with the AuthProvider for authentication.
 * Replaces NextAuth's SessionProvider with our custom auth system.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
