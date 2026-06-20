"use client";

import { useMemo, useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { parseInvoiceInstruction } from "@/lib/ai-parser";
import { calcTotals, lineItemAmount } from "@/lib/calculations";
import { formatCurrency } from "@/lib/format";

const EXAMPLE =
  "Create an invoice for ABC Plumbing for 4 hours labour at $85 per hour, 2 replacement parts at $45 each, due in 7 days, GST included.";

export function LandingAiDemo() {
  const [text, setText] = useState(EXAMPLE);
  const draft = useMemo(() => parseInvoiceInstruction(text), [text]);
  const totals = useMemo(
    () => calcTotals(draft.lineItems, "flat", 0, 0),
    [draft]
  );

  return (
    <div className="rounded-xl2 border border-ink-200/60 bg-white p-5 shadow-pop sm:p-6">
      <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-teal-700">
        <Sparkles size={14} />
        Type an instruction, get an invoice
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="w-full resize-none rounded-lg border border-ink-200 bg-paper-50 px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
      />

      <div className="mt-4 rounded-lg border border-ink-100 bg-paper-50 p-4">
        <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-ink-500">
          <span>Bill to</span>
          <span>Due in {draft.dueInDays} days</span>
        </div>
        <p className="mt-1 text-sm font-semibold text-ink-900">{draft.customerName}</p>

        <div className="mt-3 space-y-1.5">
          {draft.lineItems.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-ink-700">
              <span>
                {item.quantity} × {item.description}
              </span>
              <span>{formatCurrency(lineItemAmount(item))}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex justify-between border-t border-ink-200 pt-2 text-sm font-semibold text-ink-900">
          <span>Total {draft.taxInclusive ? "(GST incl.)" : "(+ GST)"}</span>
          <span>{formatCurrency(totals.total)}</span>
        </div>
      </div>

      <a
        href="/login"
        className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
      >
        Try it on your own invoice
        <ArrowRight size={15} />
      </a>
    </div>
  );
}
