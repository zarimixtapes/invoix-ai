import './styles.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BuildMind AI',
  description: 'AI-first construction management MVP for builders.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
