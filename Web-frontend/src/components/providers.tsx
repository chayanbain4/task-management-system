'use client';

import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/auth-context';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      {children}
      <Toaster position="top-right" />
    </AuthProvider>
  );
};
