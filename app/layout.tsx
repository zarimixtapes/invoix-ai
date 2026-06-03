import type { Metadata } from 'next';
import './styles.css';

export const metadata: Metadata = {
  title: 'BuildMind AI Functional MVP',
  description: 'Functional AI construction documentation MVP with CRUD, roles, drafts, trial and paywall hooks.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
