import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import router from './routes/index.tsx';
import { RouterProvider } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import QueryClient from '@/utils/QueryClient.tsx';
import { LoadingBarContainer } from 'react-top-loading-bar';
import { Toaster } from './components/ui/sonner.tsx';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={QueryClient}>
      <LoadingBarContainer
        props={{
          color: 'black',
          height: 3,
          shadow: false,
        }}
      >
        <RouterProvider router={router} />
        <Toaster visibleToasts={5} richColors closeButton position='top-center' />
        <ReactQueryDevtools buttonPosition='bottom-left' />
      </LoadingBarContainer>
    </QueryClientProvider>
  </StrictMode>,
);
