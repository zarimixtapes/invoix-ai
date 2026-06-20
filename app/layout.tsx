import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Invoix AI — Invoicing for freelancers & small businesses",
  description:
    "Generate invoices, quotes, and follow-ups from a single plain-English instruction. Built for freelancers, tradies, cleaners, and online sellers.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans text-ink-900 antialiased">{children}</body>
    </html>
  );
}
