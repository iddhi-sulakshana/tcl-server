import { Outlet, useRouteError } from 'react-router';
import Loadingbar from './Loadingbar';
import ErrorDisplay from './ErrorDisplay';
import useTheme from '@/hooks/useTheme';
import useValidate from '@/hooks/useValidate';

export default function Main() {
  const error = useRouteError();
  // Handle theme change when the first page loaded hook
  useTheme();
  // Check if the token is valid when the page first loaded
  useValidate();

  if (error) {
    console.error(error);
    return (
      <main className='h-screen w-screen flex flex-col items-center justify-center bg-center bg-cover'>
        <ErrorDisplay error={error} />
      </main>
    );
  }
  return (
    <div className='h-screen w-screen'>
      <Loadingbar />
      <Outlet />
    </div>
  );
}
