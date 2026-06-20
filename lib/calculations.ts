import { DiscountType, Invoice, InvoiceTotals, LineItem, Quote } from "./types";

export function lineItemAmount(item: LineItem): number {
  return round2(item.quantity * item.unitPrice);
}

export function lineItemTax(item: LineItem): number {
  return round2(lineItemAmount(item) * (item.taxRate / 100));
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calcTotals(
  lineItems: LineItem[],
  discountType: DiscountType,
  discountValue: number,
  shipping: number,
  amountPaid = 0
): InvoiceTotals {
  const subtotal = round2(
    lineItems.reduce((sum, item) => sum + lineItemAmount(item), 0)
  );

  const discountAmount =
    discountType === "percent"
      ? round2(subtotal * ((discountValue || 0) / 100))
      : round2(discountValue || 0);

  const cappedDiscount = Math.min(discountAmount, subtotal);
  const taxableBase = round2(subtotal - cappedDiscount);

  // Tax is calculated per line item proportionally against the discounted base,
  // so a discount reduces tax owed too (matches how most invoicing tools behave).
  const discountRatio = subtotal > 0 ? cappedDiscount / subtotal : 0;
  const taxTotal = round2(
    lineItems.reduce((sum, item) => {
      const itemAmount = lineItemAmount(item);
      const itemAfterDiscount = itemAmount * (1 - discountRatio);
      return sum + itemAfterDiscount * (item.taxRate / 100);
    }, 0)
  );

  const shippingAmount = round2(shipping || 0);
  const total = round2(taxableBase + taxTotal + shippingAmount);
  const balanceDue = round2(total - (amountPaid || 0));

  return {
    subtotal,
    discountAmount: cappedDiscount,
    taxableBase,
    taxTotal,
    shipping: shippingAmount,
    total,
    balanceDue,
  };
}

export function invoiceTotals(invoice: Invoice): InvoiceTotals {
  return calcTotals(
    invoice.lineItems,
    invoice.discountType,
    invoice.discountValue,
    invoice.shipping,
    invoice.amountPaid
  );
}

export function quoteTotals(quote: Quote): InvoiceTotals {
  return calcTotals(
    quote.lineItems,
    quote.discountType,
    quote.discountValue,
    quote.shipping,
    0
  );
}

export function getEffectiveInvoiceStatus(invoice: Invoice): Invoice["status"] {
  if (invoice.status === "paid" || invoice.status === "cancelled") {
    return invoice.status;
  }
  const totals = invoiceTotals(invoice);
  const due = new Date(invoice.dueDate);
  due.setHours(23, 59, 59, 999);
  const isOverdue = due.getTime() < Date.now() && totals.balanceDue > 0;
  if (isOverdue && invoice.status !== "draft") return "overdue";
  return invoice.status;
}

export function emptyLineItem(overrides: Partial<LineItem> = {}): LineItem {
  return {
    id: `li_${Math.random().toString(36).slice(2, 10)}`,
    description: "",
    quantity: 1,
    unitPrice: 0,
    taxRate: 10,
    ...overrides,
  };
}
