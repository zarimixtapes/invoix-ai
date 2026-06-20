"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Wand2, Info } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToastStore } from "@/lib/toast-store";
import { ParsedInvoiceDraft } from "@/lib/ai-parser";
import { lineItemAmount, calcTotals } from "@/lib/calculations";
import { formatCurrency, addDaysISO, todayISO } from "@/lib/format";
import { Button, Textarea } from "./ui/primitives";
import { buildInvoiceEmailDraft } from "@/lib/email-templates";
import { Invoice } from "@/lib/types";

const EXAMPLE =
  "Create an invoice for ABC Plumbing for 4 hours labour at $85 per hour, 2 replacement parts at $45 each, due in 7 days, GST included.";

export function AiInvoiceGenerator({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const push = useToastStore((s) => s.push);
  const business = useStore((s) => s.business);
  const customers = useStore((s) => s.customers);
  const addCustomer = useStore((s) => s.addCustomer);
  const addInvoice = useStore((s) => s.addInvoice);
  const addEmailDraft = useStore((s) => s.addEmailDraft);
  const recordAiUsage = useStore((s) => s.recordAiUsage);
  const canUseAi = useStore((s) => s.canUseAi);
  const canCreateInvoice = useStore((s) => s.canCreateInvoice);

  const [instruction, setInstruction] = useState(compact ? "" : EXAMPLE);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<ParsedInvoiceDraft | null>(null);
  const [mode, setMode] = useState<"openai" | "fallback" | null>(null);
  const [apiMessage, setApiMessage] = useState("");
  const [creating, setCreating] = useState(false);

  const aiAllowed = canUseAi();
  const invoiceAllowed = canCreateInvoice();

  async function handleGenerate() {
    if (!instruction.trim()) {
      push("Type an instruction first.", "error");
      return;
    }
    if (!aiAllowed) {
      push("You've reached your AI generation limit for this plan. Upgrade to continue.", "error");
      return;
    }
    setLoading(true);
    setDraft(null);
    try {
      const res = await fetch("/api/ai/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate invoice draft.");
      setDraft(data.draft);
      setMode(data.mode);
      setApiMessage(data.message || "");
      recordAiUsage(instruction, data.mode);
    } catch (err) {
      push(err instanceof Error ? err.message : "Something went wrong generating the draft.", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleCreateInvoice() {
    if (!draft) return;
    if (!invoiceAllowed) {
      push("You've reached your monthly invoice limit on the Free plan. Upgrade to continue.", "error");
      return;
    }
    setCreating(true);
    try {
      let customer = customers.find(
        (c) =>
          c.name.toLowerCase() === draft.customerName.toLowerCase() ||
          (c.businessName && c.businessName.toLowerCase() === draft.customerName.toLowerCase())
      );
      if (!customer) {
        customer = addCustomer({
          name: draft.customerName,
          businessName: draft.customerName,
          email: "",
          phone: "",
          address: "",
          abn: "",
          notes: "Added automatically from AI invoice generator.",
        });
      }

      const now = todayISO();
      const invoice: Invoice = addInvoice({
        customerId: customer.id,
        customerName: customer.businessName || customer.name,
        customerEmail: customer.email,
        customerAddress: customer.address || "",
        issueDate: now,
        dueDate: addDaysISO(draft.dueInDays, now),
        lineItems: draft.lineItems,
        discountType: "flat",
        discountValue: 0,
        shipping: 0,
        notes: draft.notes,
        paymentTerms: business.defaultPaymentTerms,
        status: "draft",
        amountPaid: 0,
        sourceQuoteId: null,
        aiGenerated: true,
      });

      const emailDraft = buildInvoiceEmailDraft("send_invoice", invoice, business);
      addEmailDraft({
        type: "send_invoice",
        subject: emailDraft.subject,
        recipientEmail: invoice.customerEmail,
        body: emailDraft.body,
        relatedInvoiceId: invoice.id,
        relatedQuoteId: null,
        status: "draft",
      });

      push(`Invoice ${invoice.number} created from AI draft.`);
      setDraft(null);
      setInstruction(compact ? "" : EXAMPLE);
      router.push(`/invoices/${invoice.id}`);
    } finally {
      setCreating(false);
    }
  }

  const totals = draft ? calcTotals(draft.lineItems, "flat", 0, 0) : null;

  return (
    <div>
      {!compact && (
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-teal-700">
          <Sparkles size={16} />
          Describe the job, get a structured invoice
        </div>
      )}

      <Textarea
        rows={compact ? 2 : 3}
        placeholder={compact ? "e.g. Invoice Daniel Reyes for a 3 hour clean at $60/hr, due in 7 days" : EXAMPLE}
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size={compact ? "sm" : "md"}
          icon={<Wand2 size={15} />}
          onClick={handleGenerate}
          disabled={loading || !aiAllowed}
        >
          {loading ? "Generating…" : "Generate invoice draft"}
        </Button>
        {!aiAllowed && (
          <span className="text-xs text-coral-600">
            AI generation limit reached for your plan —{" "}
            <a href="/billing" className="underline">
              upgrade to continue
            </a>
            .
          </span>
        )}
      </div>

      {mode === "fallback" && apiMessage && (
        <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          <Info size={14} className="mt-0.5 shrink-0" />
          {apiMessage}
        </p>
      )}

      {draft && totals && (
        <div className="mt-4 rounded-lg border border-ink-200/60 bg-paper-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink-900">{draft.customerName}</p>
            <span className="text-xs text-ink-500">Due in {draft.dueInDays} days</span>
          </div>
          <div className="mt-2 space-y-1">
            {draft.lineItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-ink-700">
                <span>
                  {item.quantity} × {item.description}
                </span>
                <span>{formatCurrency(lineItemAmount(item))}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between border-t border-ink-200 pt-2 text-sm font-semibold text-ink-900">
            <span>Total</span>
            <span>{formatCurrency(totals.total)}</span>
          </div>
          <Button
            type="button"
            size="sm"
            className="mt-3"
            onClick={handleCreateInvoice}
            disabled={creating || !invoiceAllowed}
          >
            {creating ? "Creating…" : "Create this invoice"}
          </Button>
          {!invoiceAllowed && (
            <p className="mt-2 text-xs text-coral-600">
              Monthly invoice limit reached on the Free plan —{" "}
              <a href="/billing" className="underline">
                upgrade to continue
              </a>
              .
            </p>
          )}
        </div>
      )}
    </div>
  );
}
