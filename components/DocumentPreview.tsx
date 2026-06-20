"use client";

import { Business, Invoice, Quote } from "@/lib/types";
import { invoiceTotals, quoteTotals, lineItemAmount } from "@/lib/calculations";
import { formatCurrency, formatDate } from "@/lib/format";
import { InvoiceStatusBadge, QuoteStatusBadge } from "./StatusBadge";

export function DocumentPreview({
  kind,
  doc,
  business,
}: {
  kind: "invoice" | "quote";
  doc: Invoice | Quote;
  business: Business;
}) {
  const totals = kind === "invoice" ? invoiceTotals(doc as Invoice) : quoteTotals(doc as Quote);
  const isInvoice = kind === "invoice";
  const invoice = doc as Invoice;
  const quote = doc as Quote;

  return (
    <div
      id="document-preview"
      className="mx-auto w-full max-w-3xl bg-white p-6 text-ink-900 shadow-card sm:p-10 print:shadow-none"
      style={{ borderTop: `5px solid ${business.brandColor || "#0F9D87"}` }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {business.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={business.logoDataUrl} alt={business.name} className="mb-3 h-12 object-contain" />
          ) : (
            <div
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg text-lg font-bold text-white"
              style={{ backgroundColor: business.brandColor || "#0F9D87" }}
            >
              {business.name?.[0] || "I"}
            </div>
          )}
          <h1 className="font-display text-xl font-semibold">{business.name}</h1>
          <p className="mt-1 whitespace-pre-line text-sm text-ink-600">{business.address}</p>
          <p className="text-sm text-ink-600">{business.email}{business.phone ? ` · ${business.phone}` : ""}</p>
          {business.abn && <p className="text-sm text-ink-600">ABN {business.abn}</p>}
        </div>

        <div className="text-right">
          <h2 className="font-display text-2xl font-semibold uppercase tracking-wide text-ink-900">
            {isInvoice ? "Tax Invoice" : "Quote"}
          </h2>
          <p className="mt-1 text-sm text-ink-600">{doc.number}</p>
          <div className="mt-2">
            {isInvoice ? (
              <InvoiceStatusBadge status={invoice.status} />
            ) : (
              <QuoteStatusBadge status={quote.status} />
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Bill to</p>
          <p className="mt-1 text-sm font-semibold text-ink-900">{doc.customerName}</p>
          <p className="whitespace-pre-line text-sm text-ink-600">{doc.customerAddress}</p>
          <p className="text-sm text-ink-600">{doc.customerEmail}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
            {isInvoice ? "Issue date" : "Quote date"}
          </p>
          <p className="mt-1 text-sm text-ink-900">{formatDate(doc.issueDate)}</p>
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-ink-500">
            {isInvoice ? "Due date" : "Valid until"}
          </p>
          <p className="mt-1 text-sm text-ink-900">
            {formatDate(isInvoice ? invoice.dueDate : quote.expiryDate)}
          </p>
        </div>
        {isInvoice && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Payment terms</p>
            <p className="mt-1 text-sm text-ink-600">{invoice.paymentTerms || "—"}</p>
          </div>
        )}
      </div>

      <table className="mt-8 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-ink-200 text-left text-xs uppercase tracking-wide text-ink-500">
            <th className="py-2 font-medium">Description</th>
            <th className="py-2 text-right font-medium">Qty</th>
            <th className="py-2 text-right font-medium">Unit price</th>
            <th className="py-2 text-right font-medium">Tax</th>
            <th className="py-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {doc.lineItems.map((item) => (
            <tr key={item.id} className="border-b border-ink-100">
              <td className="py-2.5 pr-2">{item.description || "—"}</td>
              <td className="py-2.5 text-right">{item.quantity}</td>
              <td className="py-2.5 text-right">{formatCurrency(item.unitPrice)}</td>
              <td className="py-2.5 text-right text-ink-500">{item.taxRate}%</td>
              <td className="py-2.5 text-right font-medium">{formatCurrency(lineItemAmount(item))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-[260px] space-y-1.5 text-sm">
          <div className="flex justify-between text-ink-600">
            <span>Subtotal</span>
            <span>{formatCurrency(totals.subtotal)}</span>
          </div>
          {totals.discountAmount > 0 && (
            <div className="flex justify-between text-ink-600">
              <span>Discount</span>
              <span>-{formatCurrency(totals.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-ink-600">
            <span>Tax / GST</span>
            <span>{formatCurrency(totals.taxTotal)}</span>
          </div>
          {totals.shipping > 0 && (
            <div className="flex justify-between text-ink-600">
              <span>Shipping</span>
              <span>{formatCurrency(totals.shipping)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-ink-200 pt-1.5 text-base font-semibold text-ink-900">
            <span>Total</span>
            <span>{formatCurrency(totals.total)}</span>
          </div>
          {isInvoice && invoice.amountPaid > 0 && (
            <>
              <div className="flex justify-between text-ink-600">
                <span>Amount paid</span>
                <span>{formatCurrency(invoice.amountPaid)}</span>
              </div>
              <div className="flex justify-between font-semibold text-teal-700">
                <span>Balance due</span>
                <span>{formatCurrency(totals.balanceDue)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {doc.notes && (
        <div className="mt-8 border-t border-ink-100 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Notes</p>
          <p className="mt-1 whitespace-pre-line text-sm text-ink-600">{doc.notes}</p>
        </div>
      )}

      <p className="mt-10 text-center text-xs text-ink-400">
        Generated with Invoix AI — {business.name}
      </p>
    </div>
  );
}
