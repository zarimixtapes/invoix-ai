"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Printer, Mail, Copy, Trash2, Send, CheckCircle2, Ban } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToastStore } from "@/lib/toast-store";
import { DiscountType, Invoice, InvoiceStatus, LineItem } from "@/lib/types";
import { invoiceTotals } from "@/lib/calculations";
import { addDaysISO, todayISO } from "@/lib/format";
import { Button, ConfirmDialog, Field, Input, Modal, Select, Textarea } from "./ui/primitives";
import { LineItemsEditor } from "./LineItemsEditor";
import { TotalsEditor, TotalsSummary } from "./TotalsSummary";
import { InvoiceStatusBadge } from "./StatusBadge";
import { DocumentPreview } from "./DocumentPreview";
import { CustomerFormModal } from "./CustomerFormModal";
import { buildInvoiceEmailDraft } from "@/lib/email-templates";

interface FormState {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  issueDate: string;
  dueDate: string;
  lineItems: LineItem[];
  discountType: DiscountType;
  discountValue: number;
  shipping: number;
  notes: string;
  paymentTerms: string;
}

function toFormState(invoice: Invoice): FormState {
  return {
    customerId: invoice.customerId,
    customerName: invoice.customerName,
    customerEmail: invoice.customerEmail,
    customerAddress: invoice.customerAddress,
    issueDate: invoice.issueDate.slice(0, 10),
    dueDate: invoice.dueDate.slice(0, 10),
    lineItems: invoice.lineItems,
    discountType: invoice.discountType,
    discountValue: invoice.discountValue,
    shipping: invoice.shipping,
    notes: invoice.notes,
    paymentTerms: invoice.paymentTerms,
  };
}

export function InvoiceEditor({ invoiceId }: { invoiceId?: string }) {
  const router = useRouter();
  const push = useToastStore((s) => s.push);
  const business = useStore((s) => s.business);
  const customers = useStore((s) => s.customers);
  const products = useStore((s) => s.products);
  const invoices = useStore((s) => s.invoices);
  const addInvoice = useStore((s) => s.addInvoice);
  const updateInvoice = useStore((s) => s.updateInvoice);
  const deleteInvoice = useStore((s) => s.deleteInvoice);
  const duplicateInvoice = useStore((s) => s.duplicateInvoice);
  const setInvoiceStatus = useStore((s) => s.setInvoiceStatus);
  const recordPayment = useStore((s) => s.recordPayment);
  const addEmailDraft = useStore((s) => s.addEmailDraft);
  const canCreateInvoice = useStore((s) => s.canCreateInvoice);

  const existing = invoiceId ? invoices.find((i) => i.id === invoiceId) : undefined;
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
          dueDate: addDaysISO(7).slice(0, 10),
          lineItems: [],
          discountType: "flat",
          discountValue: 0,
          shipping: 0,
          notes: "",
          paymentTerms: business.defaultPaymentTerms,
        }
  );
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [error, setError] = useState("");

  // Auto-select a newly added customer once the modal creates one.
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

  const previewInvoice: Invoice = existing
    ? { ...existing, ...form, issueDate: form.issueDate, dueDate: form.dueDate }
    : {
        id: "preview",
        number: `${business.invoicePrefix}-${business.nextInvoiceNumber}`,
        ...form,
        status: "draft",
        amountPaid: 0,
        createdAt: todayISO(),
        updatedAt: todayISO(),
        sourceQuoteId: null,
        aiGenerated: false,
      };

  const totals = invoiceTotals(previewInvoice);

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

  function handleSave(thenStatus?: InvoiceStatus) {
    if (!validate()) return;
    if (isEdit && existing) {
      updateInvoice(existing.id, { ...form, ...(thenStatus ? { status: thenStatus } : {}) });
      push("Invoice saved.");
    } else {
      if (!canCreateInvoice()) {
        push("You've reached your monthly invoice limit on the Free plan. Upgrade to continue.", "error");
        return;
      }
      const created = addInvoice({
        ...form,
        status: thenStatus || "draft",
        amountPaid: 0,
        sourceQuoteId: null,
        aiGenerated: false,
      });
      push(`Invoice ${created.number} created.`);
      router.push(`/invoices/${created.id}`);
      return;
    }
  }

  function handleGenerateEmail(type: "send_invoice" | "payment_reminder" | "overdue_notice" | "thank_you_payment") {
    if (!existing) {
      push("Save the invoice before generating an email.", "error");
      return;
    }
    const draft = buildInvoiceEmailDraft(type, existing, business);
    addEmailDraft({
      type,
      subject: draft.subject,
      recipientEmail: existing.customerEmail,
      body: draft.body,
      relatedInvoiceId: existing.id,
      relatedQuoteId: null,
      status: "draft",
    });
    push("Email draft created — find it in Email Drafts.");
    router.push("/emails");
  }

  function handleRecordPayment() {
    if (!existing) return;
    if (paymentAmount <= 0) {
      push("Enter a payment amount greater than zero.", "error");
      return;
    }
    recordPayment(existing.id, paymentAmount, "Manual");
    push("Payment recorded.");
    setShowPaymentModal(false);
    setPaymentAmount(0);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">
            {isEdit ? previewInvoice.number : "New invoice"}
          </h1>
          {isEdit && existing && (
            <div className="mt-1.5">
              <InvoiceStatusBadge status={existing.status} />
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {isEdit && existing && (
            <>
              <Button variant="outline" size="sm" icon={<Copy size={14} />} onClick={() => {
                const copy = duplicateInvoice(existing.id);
                if (copy) {
                  push(`Duplicated as ${copy.number}.`);
                  router.push(`/invoices/${copy.id}`);
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
                <Input
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                />
              </Field>
              <Field label="Customer email">
                <Input
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                />
              </Field>
              <Field label="Customer address">
                <Input
                  value={form.customerAddress}
                  onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
                />
              </Field>
            </div>
          </div>

          <div className="rounded-xl2 border border-ink-200/60 bg-white p-5">
            <h2 className="text-sm font-semibold text-ink-900">Dates &amp; terms</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <Field label="Issue date">
                <Input
                  type="date"
                  value={form.issueDate}
                  onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                />
              </Field>
              <Field label="Due date">
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </Field>
              <Field label="Payment terms">
                <Input
                  value={form.paymentTerms}
                  onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                />
              </Field>
            </div>
          </div>

          <div className="rounded-xl2 border border-ink-200/60 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-ink-900">Line items</h2>
            <LineItemsEditor
              items={form.lineItems}
              onChange={(lineItems) => setForm({ ...form, lineItems })}
              products={products}
            />
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
              <Textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
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
            <TotalsSummary totals={totals} amountPaid={existing?.amountPaid} />
          </div>

          {isEdit && existing && (
            <div className="rounded-xl2 border border-ink-200/60 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold text-ink-900">Actions</h2>
              <div className="flex flex-wrap gap-2">
                {existing.status !== "sent" && existing.status !== "paid" && (
                  <Button size="sm" variant="outline" icon={<Send size={14} />} onClick={() => { setInvoiceStatus(existing.id, "sent"); push("Marked as sent."); }}>
                    Mark as sent
                  </Button>
                )}
                {existing.status !== "paid" && (
                  <Button size="sm" variant="outline" icon={<CheckCircle2 size={14} />} onClick={() => setShowPaymentModal(true)}>
                    Record payment
                  </Button>
                )}
                {existing.status !== "cancelled" && existing.status !== "paid" && (
                  <Button size="sm" variant="ghost" icon={<Ban size={14} />} onClick={() => { setInvoiceStatus(existing.id, "cancelled"); push("Invoice cancelled."); }}>
                    Cancel invoice
                  </Button>
                )}
              </div>

              <h3 className="mb-2 mt-4 text-xs font-medium uppercase tracking-wide text-ink-500">
                Email drafts
              </h3>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" icon={<Mail size={14} />} onClick={() => handleGenerateEmail("send_invoice")}>
                  Send invoice
                </Button>
                <Button size="sm" variant="outline" icon={<Mail size={14} />} onClick={() => handleGenerateEmail("payment_reminder")}>
                  Reminder
                </Button>
                <Button size="sm" variant="outline" icon={<Mail size={14} />} onClick={() => handleGenerateEmail("overdue_notice")}>
                  Overdue notice
                </Button>
                <Button size="sm" variant="outline" icon={<Mail size={14} />} onClick={() => handleGenerateEmail("thank_you_payment")}>
                  Thank you
                </Button>
              </div>
            </div>
          )}

          <div>
            <h2 className="mb-2 text-sm font-semibold text-ink-900">Preview</h2>
            <div className="origin-top scale-[0.78] rounded-xl2 border border-ink-200/60 bg-paper-50 p-3">
              <DocumentPreview kind="invoice" doc={previewInvoice} business={business} />
            </div>
          </div>
        </div>
      </div>

      <CustomerFormModal open={showCustomerModal} onClose={() => setShowCustomerModal(false)} />

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete this invoice?"
        description="This will permanently remove the invoice from your records."
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          if (existing) {
            deleteInvoice(existing.id);
            push("Invoice deleted.");
            router.push("/invoices");
          }
        }}
      />

      <Modal open={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Record a payment" width="max-w-sm">
        <Field label="Amount received">
          <Input
            type="number"
            min={0}
            step="0.01"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
            autoFocus
          />
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPaymentModal(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleRecordPayment}>
            Record payment
          </Button>
        </div>
      </Modal>
    </div>
  );
}
