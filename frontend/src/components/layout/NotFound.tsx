import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import Logo from './Logo';

export default function NotFound() {
  return (
    <section className='h-full flex justify-center items-center'>
      <div className='py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6'>
        <div className='mx-auto max-w-screen-sm text-center'>
          <div className='w-full flex justify-center'>
            <Logo />
          </div>
          <h1 className='mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500'>
            404
          </h1>
          <p className='mb-4 text-3xl tracking-tight font-bo ld text-gray-900 md:text-4xl dark:text-white'>
            Something's missing.
          </p>
          <p className='mb-4 text-lg font-light text-gray-500 dark:text-gray-400'>
            Sorry, we can't find that page. You'll find lots to explore on the home page.{' '}
          </p>
          <Link to='/'>
            <Button>Back to Homepage</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
