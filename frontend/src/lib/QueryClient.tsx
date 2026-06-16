import { QueryClient } from "@tanstack/react-query";

export default new QueryClient({
    defaultOptions: {
        queries: {
            retry: false, // no retries on error — single attempt

            refetchOnMount: true,
            refetchOnReconnect: true,
            refetchOnWindowFocus: true,
            refetchIntervalInBackground: true,
        },
        mutations: {
            retry: false, // no retries on error — single attempt
        },
    },
});
