"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuthToken } from '@/lib/auth-utils';

// This component should be included in the layout.tsx file
// It checks for auth on the client-side and redirects if needed
export function ClientAuthCheck() {
  const router = useRouter();
  const pathname = usePathname();

  // List of public paths that don't require authentication
  const publicPaths = ['/', '/auth/signin', '/auth/signup'];

  useEffect(() => {
    // Only run on the client side
    if (typeof window !== 'undefined') {
      // Skip check for public paths
      if (publicPaths.includes(pathname)) {
        return;
      }

      // Check for token
      const token = getAuthToken();
      if (!token && !pathname.startsWith('/auth/')) {
        // No token, redirect to login
        router.push('/auth/signin');
      }
    }
  }, [pathname, router]);

  // This component doesn't render anything
  return null;
}
