import { Toaster } from 'sonner';

export function Toast() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        className: 'border border-gray-100',
        style: {
          background: 'white',
          color: 'black',
        },
      }}
    />
  );
} 