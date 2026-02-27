'use client';

import dynamic from 'next/dynamic';

const ExcalidrawApp = dynamic(() => import('@/components/ExcalidrawApp'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        background: '#f8f9fa',
        color: '#6b7280',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '1rem',
        gap: 12,
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          border: '2px solid #6366f1',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      Loading canvas…
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ),
});

export default function Page() {
  return <ExcalidrawApp />;
}
