"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Printer, Mail, Copy, Trash2, ArrowRightLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToastStore } from "@/lib/toast-store";
import { DiscountType, LineItem, Quote, QuoteStatus } from "@/lib/types";
import { quoteTotals } from "@/lib/calculations";
import { addDaysISO, todayISO } from "@/lib/format";
import { Button, ConfirmDialog, Field, Input, Select, Textarea } from "./ui/primitives";
import { LineItemsEditor } from "./LineItemsEditor";
import { TotalsEditor, TotalsSummary } from "./TotalsSummary";
import { QuoteStatusBadge } from "./StatusBadge";
import { DocumentPreview } from "./DocumentPreview";
import { CustomerFormModal } from "./CustomerFormModal";
import { buildQuoteFollowUpDraft } from "@/lib/email-templates";

interface FormState {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  issueDate: string;
  expiryDate: string;
  lineItems: LineItem[];
  discountType: DiscountType;
  discountValue: number;
  shipping: number;
  notes: string;
}

function toFormState(quote: Quote): FormState {
  return {
    customerId: quote.customerId,
    customerName: quote.customerName,
    customerEmail: quote.customerEmail,
    customerAddress: quote.customerAddress,
    issueDate: quote.issueDate.slice(0, 10),
    expiryDate: quote.expiryDate.slice(0, 10),
    lineItems: quote.lineItems,
    discountType: quote.discountType,
    discountValue: quote.discountValue,
    shipping: quote.shipping,
    notes: quote.notes,
  };
}

export function QuoteEditor({ quoteId }: { quoteId?: string }) {
  const router = useRouter();
  const push = useToastStore((s) => s.push);
  const business = useStore((s) => s.business);
  const customers = useStore((s) => s.customers);
  const products = useStore((s) => s.products);
  const quotes = useStore((s) => s.quotes);
  const addQuote = useStore((s) => s.addQuote);
  const updateQuote = useStore((s) => s.updateQuote);
  const deleteQuote = useStore((s) => s.deleteQuote);
  const duplicateQuote = useStore((s) => s.duplicateQuote);
  const setQuoteStatus = useStore((s) => s.setQuoteStatus);
  const convertQuoteToInvoice = useStore((s) => s.convertQuoteToInvoice);
  const addEmailDraft = useStore((s) => s.addEmailDraft);

  const existing = quoteId ? quotes.find((q) => q.id === quoteId) : undefined;
  const isEdit = Boolean(existing);

  const [form, setForm] = useState<FormState>(
    existing
      ? toFormState(existing)
      : {
          customerId: "",
          customerName: "",
          customerEmail: "",
          customerAddress: "",
          issueDate: todayISO().slice(0, 10),
          expiryDate: addDaysISO(30).slice(0, 10),
          lineItems: [],
          discountType: "flat",
          discountValue: 0,
          shipping: 0,
          notes: "",
        }
  );
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");

  const prevCustomerCount = useMemo(() => customers.length, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (customers.length > prevCustomerCount && !showCustomerModal) {
      const newest = customers[0];
      setForm((f) => ({
        ...f,
        customerId: newest.id,
        customerName: newest.businessName || newest.name,
        customerEmail: newest.email,
        customerAddress: newest.address || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customers.length, showCustomerModal]);

  function handleCustomerSelect(id: string) {
    const customer = customers.find((c) => c.id === id);
    if (!customer) {
      setForm((f) => ({ ...f, customerId: "" }));
      return;
    }
    setForm((f) => ({
      ...f,
      customerId: customer.id,
      customerName: customer.businessName || customer.name,
      customerEmail: customer.email,
      customerAddress: customer.address || "",
    }));
  }

  const previewQuote: Quote = existing
    ? { ...existing, ...form }
    : {
        id: "preview",
        number: `QUO-${business.nextQuoteNumber}`,
        ...form,
        status: "draft",
        createdAt: todayISO(),
        updatedAt: todayISO(),
        convertedInvoiceId: null,
      };

  const totals = quoteTotals(previewQuote);

  function validate(): boolean {
    if (!form.customerName.trim()) {
      setError("Select or enter a customer before saving.");
      return false;
    }
    if (form.lineItems.length === 0) {
      setError("Add at least one line item.");
      return false;
    }
    setError("");
    return true;
  }

  function handleSave(thenStatus?: QuoteStatus) {
    if (!validate()) return;
    if (isEdit && existing) {
      updateQuote(existing.id, { ...form, ...(thenStatus ? { status: thenStatus } : {}) });
      push("Quote saved.");
    } else {
      const created = addQuote({ ...form, status: thenStatus || "draft" });
      push(`Quote ${created.number} created.`);
      router.push(`/quotes/${created.id}`);
    }
  }

  function handleConvert() {
    if (!existing) return;
    const invoice = convertQuoteToInvoice(existing.id);
    if (invoice) {
      push(`Converted to invoice ${invoice.number}.`);
      router.push(`/invoices/${invoice.id}`);
    }
  }

  function handleFollowUpEmail() {
    if (!existing) {
      push("Save the quote before generating an email.", "error");
      return;
    }
    const draft = buildQuoteFollowUpDraft(existing, business);
    addEmailDraft({
      type: "quote_follow_up",
      subject: draft.subject,
      recipientEmail: existing.customerEmail,
      body: draft.body,
      relatedInvoiceId: null,
      relatedQuoteId: existing.id,
      status: "draft",
    });
    push("Follow-up email drafted — find it in Email Drafts.");
    router.push("/emails");
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">
            {isEdit ? previewQuote.number : "New quote"}
          </h1>
          {isEdit && existing && (
            <div className="mt-1.5">
              <QuoteStatusBadge status={existing.status} />
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {isEdit && existing && (
            <>
              {existing.status !== "converted" && (
                <Button size="sm" icon={<ArrowRightLeft size={14} />} onClick={handleConvert}>
                  Convert to invoice
                </Button>
              )}
              <Button variant="outline" size="sm" icon={<Copy size={14} />} onClick={() => {
                const copy = duplicateQuote(existing.id);
                if (copy) {
                  push(`Duplicated as ${copy.number}.`);
                  router.push(`/quotes/${copy.id}`);
                }
              }}>
                Duplicate
              </Button>
              <Button variant="outline" size="sm" icon={<Printer size={14} />} onClick={() => window.print()}>
                Print / PDF
              </Button>
              <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={() => setShowDeleteConfirm(true)}>
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          {error && <p className="rounded-lg bg-coral-50 px-3 py-2 text-sm text-coral-600">{error}</p>}

          <div className="rounded-xl2 border border-ink-200/60 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink-900">Customer</h2>
              <button
                type="button"
                onClick={() => setShowCustomerModal(true)}
                className="flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline"
              >
                <Plus size={13} /> New customer
              </button>
            </div>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field label="Select existing customer">
                <Select value={form.customerId} onChange={(e) => handleCustomerSelect(e.target.value)}>
                  <option value="">— Choose customer —</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.businessName || c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Customer / business name" required>
                <Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
              </Field>
              <Field label="Customer email">
                <Input type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} />
              </Field>
              <Field label="Customer address">
                <Input value={form.customerAddress} onChange={(e) => setForm({ ...form, customerAddress: e.target.value })} />
              </Field>
            </div>
          </div>

          <div className="rounded-xl2 border border-ink-200/60 bg-white p-5">
            <h2 className="text-sm font-semibold text-ink-900">Dates</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field label="Issue date">
                <Input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} />
              </Field>
              <Field label="Valid until">
                <Input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
              </Field>
            </div>
          </div>

          <div className="rounded-xl2 border border-ink-200/60 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-ink-900">Line items</h2>
            <LineItemsEditor items={form.lineItems} onChange={(lineItems) => setForm({ ...form, lineItems })} products={products} />
          </div>

          <div className="rounded-xl2 border border-ink-200/60 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-ink-900">Discount &amp; shipping</h2>
            <TotalsEditor
              discountType={form.discountType}
              discountValue={form.discountValue}
              shipping={form.shipping}
              onChange={(patch) => setForm({ ...form, ...patch })}
            />
          </div>

          <div className="rounded-xl2 border border-ink-200/60 bg-white p-5">
            <Field label="Notes">
              <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Field>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleSave()}>{isEdit ? "Save changes" : "Save as draft"}</Button>
            {!isEdit && (
              <Button variant="outline" onClick={() => handleSave("sent")}>
                Save &amp; mark as sent
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-xl2 border border-ink-200/60 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-ink-900">Totals</h2>
            <TotalsSummary totals={totals} />
          </div>

          {isEdit && existing && (
            <div className="rounded-xl2 border border-ink-200/60 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold text-ink-900">Status &amp; follow-up</h2>
              <div className="flex flex-wrap gap-2">
                {(["sent", "accepted", "declined", "expired"] as QuoteStatus[]).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={existing.status === s ? "primary" : "outline"}
                    onClick={() => { setQuoteStatus(existing.id, s); push(`Quote marked as ${s}.`); }}
                  >
                    {s[0].toUpperCase() + s.slice(1)}
                  </Button>
                ))}
              </div>
              <Button size="sm" variant="outline" icon={<Mail size={14} />} className="mt-3" onClick={handleFollowUpEmail}>
                Draft follow-up email
              </Button>
            </div>
          )}

          <div>
            <h2 className="mb-2 text-sm font-semibold text-ink-900">Preview</h2>
            <div className="origin-top scale-[0.78] rounded-xl2 border border-ink-200/60 bg-paper-50 p-3">
              <DocumentPreview kind="quote" doc={previewQuote} business={business} />
            </div>
          </div>
        </div>
      </div>

      <CustomerFormModal open={showCustomerModal} onClose={() => setShowCustomerModal(false)} />

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete this quote?"
        description="This will permanently remove the quote from your records."
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          if (existing) {
            deleteQuote(existing.id);
            push("Quote deleted.");
            router.push("/quotes");
          }
        }}
      />
    </div>
  );
}
