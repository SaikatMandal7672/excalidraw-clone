'use client';

import dynamic from 'next/dynamic';
import { AppProvider } from '@/context/AppContext';

const ExcalidrawApp = dynamic(() => import('@/components/ExcalidrawApp'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen w-screen bg-gray-50 text-gray-500 font-sans text-base gap-3">
      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      Loading canvas…
    </div>
  ),
});

export default function Page() {
  return (
    <AppProvider>
      <ExcalidrawApp />
    </AppProvider>
  );
}
