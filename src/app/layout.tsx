import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Excalidraw Clone',
  description: 'A hand-drawn style whiteboard and diagramming tool',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
