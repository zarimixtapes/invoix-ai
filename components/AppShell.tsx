"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  FileSpreadsheet,
  Users,
  Package,
  Sparkles,
  Mail,
  Palette,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  X,
  Receipt,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { Toaster } from "./Toaster";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/quotes", label: "Quotes", icon: FileSpreadsheet },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/products", label: "Products & Services", icon: Package },
  { href: "/ai-generator", label: "AI Generator", icon: Sparkles },
  { href: "/emails", label: "Email Drafts", icon: Mail },
  { href: "/templates", label: "Templates & Branding", icon: Palette },
  { href: "/billing", label: "Billing & Payments", icon: CreditCard },
  { href: "/reports", label: "Reports & Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hasHydrated = useStore((s) => s.hasHydrated);
  const business = useStore((s) => s.business);
  const subscription = useStore((s) => s.subscription);
  const syncOverdueInvoices = useStore((s) => s.syncOverdueInvoices);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (hasHydrated) syncOverdueInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper-100">
        <div className="flex items-center gap-2 text-ink-600">
          <Receipt className="animate-pulse" size={20} />
          <span className="text-sm">Loading your workspace…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper-100">
      {/* Mobile topbar */}
      <div className="flex items-center justify-between border-b border-ink-200/60 bg-white px-4 py-3 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
            <Receipt size={16} />
          </span>
          Invoix AI
        </Link>
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="text-ink-700">
          <Menu size={22} />
        </button>
      </div>

      <div className="mx-auto flex max-w-[1400px]">
        {/* Sidebar — desktop */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-ink-200/60 bg-white lg:flex">
          <SidebarContent pathname={pathname} business={business} subscription={subscription} />
        </aside>

        {/* Sidebar — mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-ink-950/50" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white">
              <div className="flex items-center justify-between border-b border-ink-200/60 px-4 py-3">
                <span className="font-display text-lg font-semibold text-ink-900">Invoix AI</span>
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>
              <SidebarContent
                pathname={pathname}
                business={business}
                subscription={subscription}
                onNavigate={() => setMobileOpen(false)}
              />
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>

      <Toaster />
    </div>
  );
}

function SidebarContent({
  pathname,
  business,
  subscription,
  onNavigate,
}: {
  pathname: string;
  business: { name: string };
  subscription: { plan: string; state: string };
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <Link
        href="/dashboard"
        className="hidden items-center gap-2 px-5 py-5 font-display text-lg font-semibold text-ink-900 lg:flex"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
          <Receipt size={17} />
        </span>
        Invoix AI
      </Link>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-teal-50 text-teal-700" : "text-ink-600 hover:bg-paper-100 hover:text-ink-900"
              }`}
            >
              <Icon size={17} strokeWidth={active ? 2.4 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-ink-200/60 px-4 py-4">
        <div className="rounded-lg bg-paper-100 px-3 py-3">
          <p className="truncate text-xs font-medium text-ink-900">{business.name}</p>
          <p className="mt-0.5 text-xs capitalize text-ink-600/70">
            {subscription.state === "trialing" ? "Trial · all Pro features" : `${subscription.plan} plan`}
          </p>
        </div>
      </div>
    </div>
  );
}
