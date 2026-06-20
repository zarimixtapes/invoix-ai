"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Plus, Copy, Trash2, FileText } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToastStore } from "@/lib/toast-store";
import { getEffectiveInvoiceStatus, invoiceTotals } from "@/lib/calculations";
import { formatCurrency, formatDate } from "@/lib/format";
import { InvoiceStatus } from "@/lib/types";
import { Button, ConfirmDialog, EmptyState, Input, Select } from "@/components/ui/primitives";
import { InvoiceStatusBadge } from "@/components/StatusBadge";

const STATUS_OPTIONS: (InvoiceStatus | "all")[] = ["all", "draft", "sent", "paid", "overdue", "cancelled"];

export default function InvoicesPage() {
  const invoices = useStore((s) => s.invoices);
  const customers = useStore((s) => s.customers);
  const duplicateInvoice = useStore((s) => s.duplicateInvoice);
  const deleteInvoice = useStore((s) => s.deleteInvoice);
  const push = useToastStore((s) => s.push);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return invoices
      .map((inv) => ({ inv, status: getEffectiveInvoiceStatus(inv) }))
      .filter(({ inv, status }) => {
        if (statusFilter !== "all" && status !== statusFilter) return false;
        if (customerFilter !== "all" && inv.customerId !== customerFilter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          if (
            !inv.number.toLowerCase().includes(q) &&
            !inv.customerName.toLowerCase().includes(q)
          ) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => new Date(b.inv.createdAt).getTime() - new Date(a.inv.createdAt).getTime());
  }, [invoices, search, statusFilter, customerFilter]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Invoices</h1>
        <Link href="/invoices/new">
          <Button icon={<Plus size={15} />}>New invoice</Button>
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <Input
            placeholder="Search invoice # or customer…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          className="w-auto min-w-[140px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | "all")}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </Select>
        <Select
          className="w-auto min-w-[160px]"
          value={customerFilter}
          onChange={(e) => setCustomerFilter(e.target.value)}
        >
          <option value="all">All customers</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.businessName || c.name}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileText size={28} />}
          title="No invoices match your filters"
          description="Try clearing the search or filters, or create a new invoice."
          action={
            <Link href="/invoices/new">
              <Button size="sm">Create invoice</Button>
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl2 border border-ink-200/60 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-200/60 text-xs uppercase tracking-wide text-ink-500">
                  <th className="px-5 py-3 font-medium">Invoice</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Issue date</th>
                  <th className="px-5 py-3 font-medium">Due date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(({ inv, status }) => (
                  <tr key={inv.id} className="border-b border-ink-100 last:border-0 hover:bg-paper-50">
                    <td className="px-5 py-3">
                      <Link href={`/invoices/${inv.id}`} className="font-medium text-ink-900 hover:underline">
                        {inv.number}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-ink-600">{inv.customerName}</td>
                    <td className="px-5 py-3 text-ink-600">{formatDate(inv.issueDate)}</td>
                    <td className="px-5 py-3 text-ink-600">{formatDate(inv.dueDate)}</td>
                    <td className="px-5 py-3">
                      <InvoiceStatusBadge status={status} />
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-ink-900">
                      {formatCurrency(invoiceTotals(inv).total)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          title="Duplicate"
                          onClick={() => {
                            const copy = duplicateInvoice(inv.id);
                            if (copy) push(`Duplicated as ${copy.number}.`);
                          }}
                          className="rounded-lg p-1.5 text-ink-500 hover:bg-paper-200 hover:text-ink-900"
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => setDeleteId(inv.id)}
                          className="rounded-lg p-1.5 text-ink-500 hover:bg-coral-50 hover:text-coral-500"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete this invoice?"
        description="This will permanently remove the invoice from your records."
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteInvoice(deleteId);
            push("Invoice deleted.");
          }
          setDeleteId(null);
        }}
      />
    </div>
  );
}
