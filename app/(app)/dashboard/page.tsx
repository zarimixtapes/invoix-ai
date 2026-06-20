"use client";

import Link from "next/link";
import { ElementType, useMemo } from "react";
import { DollarSign, FileWarning, FileClock, CheckCircle2, FileEdit, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { getEffectiveInvoiceStatus, invoiceTotals } from "@/lib/calculations";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card } from "@/components/ui/primitives";
import { InvoiceStatusBadge } from "@/components/StatusBadge";
import { AiInvoiceGenerator } from "@/components/AiInvoiceGenerator";

function StatCard({
  icon: Icon,
  label,
  value,
  tone = "ink",
}: {
  icon: ElementType;
  label: string;
  value: string;
  tone?: "ink" | "teal" | "coral" | "amber";
}) {
  const toneClasses: Record<string, string> = {
    ink: "bg-ink-50 text-ink-700",
    teal: "bg-teal-50 text-teal-700",
    coral: "bg-coral-50 text-coral-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
          <Icon size={17} />
        </div>
        <div>
          <p className="text-xs text-ink-500">{label}</p>
          <p className="text-lg font-semibold text-ink-900">{value}</p>
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const invoices = useStore((s) => s.invoices);
  const customers = useStore((s) => s.customers);
  const business = useStore((s) => s.business);

  const stats = useMemo(() => {
    const withStatus = invoices.map((inv) => ({ inv, status: getEffectiveInvoiceStatus(inv) }));
    const paid = withStatus.filter((x) => x.status === "paid");
    const overdue = withStatus.filter((x) => x.status === "overdue");
    const sent = withStatus.filter((x) => x.status === "sent");
    const draft = withStatus.filter((x) => x.status === "draft");
    const totalRevenue = paid.reduce((sum, x) => sum + invoiceTotals(x.inv).total, 0);
    const unpaid = sent.length + overdue.length;

    return {
      totalRevenue,
      unpaid,
      overdueCount: overdue.length,
      paidCount: paid.length,
      draftCount: draft.length,
    };
  }, [invoices]);

  const monthlyRevenue = useMemo(() => {
    const months: { label: string; value: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString("en-AU", { month: "short" });
      const total = invoices
        .filter((inv) => {
          if (getEffectiveInvoiceStatus(inv) !== "paid") return false;
          const id = new Date(inv.issueDate);
          return id.getFullYear() === d.getFullYear() && id.getMonth() === d.getMonth();
        })
        .reduce((sum, inv) => sum + invoiceTotals(inv).total, 0);
      months.push({ label, value: total });
    }
    return months;
  }, [invoices]);

  const maxRevenue = Math.max(1, ...monthlyRevenue.map((m) => m.value));
  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Dashboard</h1>
          <p className="text-sm text-ink-600">Welcome back to {business.name}.</p>
        </div>
        <Link
          href="/invoices/new"
          className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700"
        >
          New invoice
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={DollarSign} label="Total revenue" value={formatCurrency(stats.totalRevenue)} tone="teal" />
        <StatCard icon={FileClock} label="Unpaid invoices" value={String(stats.unpaid)} tone="amber" />
        <StatCard icon={FileWarning} label="Overdue" value={String(stats.overdueCount)} tone="coral" />
        <StatCard icon={CheckCircle2} label="Paid" value={String(stats.paidCount)} tone="teal" />
        <StatCard icon={FileEdit} label="Drafts" value={String(stats.draftCount)} />
        <StatCard icon={Users} label="Customers" value={String(customers.length)} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-ink-900">Revenue, last 6 months</h2>
          <div className="mt-5 flex h-40 items-end gap-3">
            {monthlyRevenue.map((m) => (
              <div key={m.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-32 w-full items-end">
                  <div
                    className="w-full rounded-t-md bg-teal-500/80 transition-all"
                    style={{ height: `${Math.max(4, (m.value / maxRevenue) * 100)}%` }}
                    title={formatCurrency(m.value)}
                  />
                </div>
                <span className="text-xs text-ink-500">{m.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <AiInvoiceGenerator compact />
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-sm font-semibold text-ink-900">Recent invoices</h2>
          <Link href="/invoices" className="text-xs font-medium text-teal-700 hover:underline">
            View all
          </Link>
        </div>
        {recentInvoices.length === 0 ? (
          <p className="px-5 pb-6 text-sm text-ink-500">No invoices yet — create your first one.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-y border-ink-200/60 text-xs uppercase tracking-wide text-ink-500">
                  <th className="px-5 py-2.5 font-medium">Invoice</th>
                  <th className="px-5 py-2.5 font-medium">Customer</th>
                  <th className="px-5 py-2.5 font-medium">Due</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-ink-100 last:border-0 hover:bg-paper-50">
                    <td className="px-5 py-3">
                      <Link href={`/invoices/${inv.id}`} className="font-medium text-ink-900 hover:underline">
                        {inv.number}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-ink-600">{inv.customerName}</td>
                    <td className="px-5 py-3 text-ink-600">{formatDate(inv.dueDate)}</td>
                    <td className="px-5 py-3">
                      <InvoiceStatusBadge status={getEffectiveInvoiceStatus(inv)} />
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-ink-900">
                      {formatCurrency(invoiceTotals(inv).total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
