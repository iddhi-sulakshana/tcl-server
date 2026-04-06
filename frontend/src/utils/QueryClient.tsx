import { QueryClient } from '@tanstack/react-query';

export default new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent refetch on window focus
      refetchOnMount: false, // Prevent refetch on component mount if data is cached
      staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
      retry: 1, // If error occurs only retry for once
      retryDelay: 1000 * 5, // If error occurs retry after 5 seconds
    },
  },
});
