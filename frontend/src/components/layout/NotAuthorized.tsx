import { Link } from 'react-router';
import Logo from './Logo';
import { Button } from '../ui/button';

export default function NotAuthorized() {
  return (
    <section className='h-full flex justify-center items-center'>
      <div className='py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6'>
        <div className='mx-auto max-w-screen-sm text-center'>
          <div className='w-full flex justify-center'>
            <Logo />
          </div>
          <h1 className='mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-yellow-500'>
            403
          </h1>
          <p className='mb-4 text-3xl tracking-tight font-bold text-gray-900 dark:text-white'>
            Access Denied
          </p>
          <p className='mb-4 text-lg font-light text-gray-500 dark:text-gray-400'>
            You don’t have permission to access this page. Please contact your administrator if you
            believe this is an error.
          </p>
          <Link to='/'>
            <Button>Back to Homepage</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
