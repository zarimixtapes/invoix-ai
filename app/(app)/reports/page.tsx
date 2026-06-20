"use client";

import { useMemo } from "react";
import { Lock, TrendingUp } from "lucide-react";
import { useStore } from "@/lib/store";
import { getEffectiveInvoiceStatus, invoiceTotals } from "@/lib/calculations";
import { formatCurrency } from "@/lib/format";
import { Card } from "@/components/ui/primitives";
import { InvoiceStatus } from "@/lib/types";

const STATUS_LIST: InvoiceStatus[] = ["draft", "sent", "paid", "overdue", "cancelled"];

export default function ReportsPage() {
  const invoices = useStore((s) => s.invoices);
  const customers = useStore((s) => s.customers);
  const canUseAnalytics = useStore((s) => s.canUseAnalytics);

  const locked = !canUseAnalytics();

  const statusBreakdown = useMemo(() => {
    const counts: Record<InvoiceStatus, number> = { draft: 0, sent: 0, paid: 0, overdue: 0, cancelled: 0 };
    invoices.forEach((inv) => {
      counts[getEffectiveInvoiceStatus(inv)] += 1;
    });
    return counts;
  }, [invoices]);

  const totalPaid = useMemo(
    () => invoices.filter((i) => getEffectiveInvoiceStatus(i) === "paid").reduce((s, i) => s + invoiceTotals(i).total, 0),
    [invoices]
  );
  const totalOutstanding = useMemo(
    () =>
      invoices
        .filter((i) => ["sent", "overdue"].includes(getEffectiveInvoiceStatus(i)))
        .reduce((s, i) => s + invoiceTotals(i).balanceDue, 0),
    [invoices]
  );
  const avgInvoice = invoices.length
    ? invoices.reduce((s, i) => s + invoiceTotals(i).total, 0) / invoices.length
    : 0;

  const byCustomer = useMemo(() => {
    const map = new Map<string, number>();
    invoices
      .filter((i) => getEffectiveInvoiceStatus(i) === "paid")
      .forEach((i) => {
        map.set(i.customerName, (map.get(i.customerName) || 0) + invoiceTotals(i).total);
      });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [invoices]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Reports &amp; Analytics</h1>
      <p className="mt-1 text-sm text-ink-600">An overview of how money is moving through your business.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs text-ink-500">Total collected</p>
          <p className="mt-1 text-xl font-semibold text-teal-700">{formatCurrency(totalPaid)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-ink-500">Outstanding balance</p>
          <p className="mt-1 text-xl font-semibold text-coral-600">{formatCurrency(totalOutstanding)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-ink-500">Average invoice value</p>
          <p className="mt-1 text-xl font-semibold text-ink-900">{formatCurrency(avgInvoice)}</p>
        </Card>
      </div>

      <div className="relative mt-6">
        {locked && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-xl2 bg-white/70 backdrop-blur-sm">
            <Lock size={20} className="text-ink-500" />
            <p className="text-sm font-medium text-ink-700">Detailed analytics is a Pro feature</p>
            <a href="/billing" className="text-xs font-medium text-teal-700 underline">
              Upgrade to unlock
            </a>
          </div>
        )}
        <div className={`grid gap-5 lg:grid-cols-2 ${locked ? "pointer-events-none select-none blur-[2px]" : ""}`}>
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink-900">Invoices by status</h2>
            <div className="mt-4 space-y-3">
              {STATUS_LIST.map((s) => {
                const max = Math.max(1, invoices.length);
                return (
                  <div key={s}>
                    <div className="mb-1 flex justify-between text-xs text-ink-600">
                      <span className="capitalize">{s}</span>
                      <span>{statusBreakdown[s]}</span>
                    </div>
                    <div className="h-2 rounded-full bg-paper-200">
                      <div
                        className="h-2 rounded-full bg-teal-500"
                        style={{ width: `${(statusBreakdown[s] / max) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
              <TrendingUp size={15} /> Top customers by revenue
            </h2>
            {byCustomer.length === 0 ? (
              <p className="mt-4 text-sm text-ink-500">No paid invoices yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {byCustomer.map(([name, total]) => (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <span className="text-ink-700">{name}</span>
                    <span className="font-medium text-ink-900">{formatCurrency(total)}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-4 border-t border-ink-100 pt-3 text-xs text-ink-500">
              {customers.length} total customers on file.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
