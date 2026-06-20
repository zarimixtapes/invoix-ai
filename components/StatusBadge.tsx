import { InvoiceStatus, QuoteStatus } from "@/lib/types";

const INVOICE_STYLES: Record<InvoiceStatus, string> = {
  draft: "bg-ink-100 text-ink-700",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-teal-100 text-teal-700",
  overdue: "bg-coral-100 text-coral-600",
  cancelled: "bg-ink-100 text-ink-500 line-through",
};

const QUOTE_STYLES: Record<QuoteStatus, string> = {
  draft: "bg-ink-100 text-ink-700",
  sent: "bg-blue-100 text-blue-700",
  accepted: "bg-teal-100 text-teal-700",
  declined: "bg-coral-100 text-coral-600",
  converted: "bg-amber-100 text-amber-600",
  expired: "bg-ink-100 text-ink-500",
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${INVOICE_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${QUOTE_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
