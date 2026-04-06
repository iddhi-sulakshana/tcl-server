import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';

export default function Home() {
  return (
    <main className='pt-16 pb-16'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col items-center justify-center text-center'>
          {/* Hero Content */}
          <div className='max-w-4xl mx-auto space-y-8'>
            {/* Badge */}
            <div className='inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium'>
              <Sparkles className='h-4 w-4 mr-2' />
              Welcome to the future
            </div>

            {/* Main Heading */}
            <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight'>
              Build something{' '}
              <span className='bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent'>
                amazing
              </span>{' '}
              today
            </h1>

            {/* Subheading */}
            <p className='text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
              Create, collaborate, and scale your ideas with our powerful platform. Join thousands
              of developers who are already building the next big thing.
            </p>

            {/* CTA Buttons */}
            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
              <Button size='lg' className='text-lg px-8 py-3'>
                Get Started
                <ArrowRight className='ml-2 h-5 w-5' />
              </Button>
              <Button variant='outline' size='lg' className='text-lg px-8 py-3'>
                Learn More
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className='mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto'>
            <div className='p-6 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors'>
              <div className='w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4'>
                <Zap className='h-6 w-6 text-primary' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>Lightning Fast</h3>
              <p className='text-muted-foreground'>
                Built for speed and performance. Experience the difference with our optimized
                platform.
              </p>
            </div>

            <div className='p-6 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors'>
              <div className='w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4'>
                <Shield className='h-6 w-6 text-primary' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>Secure & Reliable</h3>
              <p className='text-muted-foreground'>
                Enterprise-grade security with 99.9% uptime guarantee. Your data is safe with us.
              </p>
            </div>

            <div className='p-6 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors'>
              <div className='w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4'>
                <Sparkles className='h-6 w-6 text-primary' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>Easy to Use</h3>
              <p className='text-muted-foreground'>
                Intuitive design and powerful features. Get started in minutes, not hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
