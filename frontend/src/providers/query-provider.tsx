'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache strategy optimized for rate limiting
            staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
            cacheTime: 10 * 60 * 1000, // 10 minutes - keep in memory
            retry: 2, // Retry twice on network errors
            refetchOnWindowFocus: false, // Don't refetch on tab focus (reduces API calls)
            refetchOnReconnect: true, // Refetch when internet reconnects
            refetchOnMount: 'always', // Always refetch on mount for fresh data
          },
          mutations: {
            retry: 1, // Retry mutations once
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
