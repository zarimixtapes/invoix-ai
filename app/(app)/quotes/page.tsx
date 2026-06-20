"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Plus, Copy, Trash2, FileSpreadsheet, ArrowRightLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToastStore } from "@/lib/toast-store";
import { quoteTotals } from "@/lib/calculations";
import { formatCurrency, formatDate } from "@/lib/format";
import { QuoteStatus } from "@/lib/types";
import { Button, ConfirmDialog, EmptyState, Input, Select } from "@/components/ui/primitives";
import { QuoteStatusBadge } from "@/components/StatusBadge";

const STATUS_OPTIONS: (QuoteStatus | "all")[] = [
  "all",
  "draft",
  "sent",
  "accepted",
  "declined",
  "converted",
  "expired",
];

export default function QuotesPage() {
  const quotes = useStore((s) => s.quotes);
  const customers = useStore((s) => s.customers);
  const duplicateQuote = useStore((s) => s.duplicateQuote);
  const deleteQuote = useStore((s) => s.deleteQuote);
  const convertQuoteToInvoice = useStore((s) => s.convertQuoteToInvoice);
  const push = useToastStore((s) => s.push);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "all">("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return quotes
      .filter((q) => {
        if (statusFilter !== "all" && q.status !== statusFilter) return false;
        if (customerFilter !== "all" && q.customerId !== customerFilter) return false;
        if (search.trim()) {
          const s = search.toLowerCase();
          if (!q.number.toLowerCase().includes(s) && !q.customerName.toLowerCase().includes(s)) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [quotes, search, statusFilter, customerFilter]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Quotes</h1>
        <Link href="/quotes/new">
          <Button icon={<Plus size={15} />}>New quote</Button>
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <Input
            placeholder="Search quote # or customer…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select className="w-auto min-w-[140px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as QuoteStatus | "all")}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </Select>
        <Select className="w-auto min-w-[160px]" value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)}>
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
          icon={<FileSpreadsheet size={28} />}
          title="No quotes match your filters"
          description="Try clearing the search or filters, or create a new quote."
          action={
            <Link href="/quotes/new">
              <Button size="sm">Create quote</Button>
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl2 border border-ink-200/60 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-200/60 text-xs uppercase tracking-wide text-ink-500">
                  <th className="px-5 py-3 font-medium">Quote</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Issue date</th>
                  <th className="px-5 py-3 font-medium">Valid until</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q) => (
                  <tr key={q.id} className="border-b border-ink-100 last:border-0 hover:bg-paper-50">
                    <td className="px-5 py-3">
                      <Link href={`/quotes/${q.id}`} className="font-medium text-ink-900 hover:underline">
                        {q.number}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-ink-600">{q.customerName}</td>
                    <td className="px-5 py-3 text-ink-600">{formatDate(q.issueDate)}</td>
                    <td className="px-5 py-3 text-ink-600">{formatDate(q.expiryDate)}</td>
                    <td className="px-5 py-3">
                      <QuoteStatusBadge status={q.status} />
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-ink-900">
                      {formatCurrency(quoteTotals(q).total)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        {q.status !== "converted" && (
                          <button
                            title="Convert to invoice"
                            onClick={() => {
                              const inv = convertQuoteToInvoice(q.id);
                              if (inv) push(`Converted to invoice ${inv.number}.`);
                            }}
                            className="rounded-lg p-1.5 text-ink-500 hover:bg-teal-50 hover:text-teal-700"
                          >
                            <ArrowRightLeft size={15} />
                          </button>
                        )}
                        <button
                          title="Duplicate"
                          onClick={() => {
                            const copy = duplicateQuote(q.id);
                            if (copy) push(`Duplicated as ${copy.number}.`);
                          }}
                          className="rounded-lg p-1.5 text-ink-500 hover:bg-paper-200 hover:text-ink-900"
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => setDeleteId(q.id)}
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
        title="Delete this quote?"
        description="This will permanently remove the quote from your records."
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteQuote(deleteId);
            push("Quote deleted.");
          }
          setDeleteId(null);
        }}
      />
    </div>
  );
}
