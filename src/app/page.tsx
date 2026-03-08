'use client';

import dynamic from 'next/dynamic';
import { AppProvider } from '@/context/AppContext';

const ExcalidrawApp = dynamic(() => import('@/components/ExcalidrawApp'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-50 gap-5">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-[2.5px] border-gray-200" />
        <div className="absolute inset-0 rounded-full border-[2.5px] border-indigo-500 border-t-transparent animate-spin" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-lg font-black text-indigo-500 tracking-tight" style={{ fontFamily: 'Caveat, cursive' }}>
          Excalidraw Clone
        </span>
        <span className="text-xs text-gray-400 font-medium tracking-wide">
          Loading canvas...
        </span>
      </div>
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
