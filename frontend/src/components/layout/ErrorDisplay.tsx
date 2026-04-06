import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { AlertTriangleIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';

interface ErrorDisplayProps {
  error: any;
}

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const getMessage = () => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'An unknown error occurred';
  };

  return (
    <Fragment>
      <div className='flex flex-col items-center justify-center text-center h-full'>
        <div className='text-red-600 mb-4'>
          <AlertTriangleIcon className='h-12 w-12 mx-auto' />
        </div>
        <h1 className='text-2xl font-bold mb-2'>Oops! Something went sideways.</h1>
        <p className='text-muted-foreground mb-4'>It's not you, it's us. But probably the code.</p>

        <div className='space-x-2'>
          <Button onClick={() => navigate(0)}>Retry</Button>
          <Button variant='secondary' onClick={() => setDialogOpen(true)}>
            Show Error
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle className='text-red-600 flex gap-2 items-center'>
              <AlertTriangleIcon className='w-5 h-5' />
              Error Details - {getMessage()}
            </DialogTitle>
          </DialogHeader>

          <div className='text-sm text-red-500 max-h-60 overflow-auto bg-muted p-2 rounded'>
            <pre className='whitespace-pre-wrap'>
              {error instanceof Error
                ? error.stack || error.message
                : typeof error === 'string'
                  ? error
                  : 'Unknown error'}
            </pre>
          </div>

          <DialogFooter className='pt-4'>
            <Button variant='outline' onClick={() => setDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}
