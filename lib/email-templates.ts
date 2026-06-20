import { EmailDraftType, Invoice, Quote, Business } from "./types";
import { formatCurrency, formatDate } from "./format";
import { invoiceTotals } from "./calculations";

export function buildInvoiceEmailDraft(
  type: Extract<
    EmailDraftType,
    "send_invoice" | "payment_reminder" | "overdue_notice" | "thank_you_payment"
  >,
  invoice: Invoice,
  business: Business
): { subject: string; body: string } {
  const totals = invoiceTotals(invoice);
  const businessName = business.name || "Your business";

  switch (type) {
    case "send_invoice":
      return {
        subject: `Invoice ${invoice.number} from ${businessName}`,
        body: [
          `Hi ${invoice.customerName},`,
          ``,
          `Please find your invoice details below.`,
          ``,
          `Invoice number: ${invoice.number}`,
          `Issue date: ${formatDate(invoice.issueDate)}`,
          `Due date: ${formatDate(invoice.dueDate)}`,
          `Amount due: ${formatCurrency(totals.balanceDue)}`,
          ``,
          `Payment terms: ${invoice.paymentTerms || "Due on receipt"}`,
          ``,
          `Thanks for your business.`,
          `${businessName}`,
        ].join("\n"),
      };
    case "payment_reminder":
      return {
        subject: `Reminder: Invoice ${invoice.number} due ${formatDate(invoice.dueDate)}`,
        body: [
          `Hi ${invoice.customerName},`,
          ``,
          `This is a friendly reminder that invoice ${invoice.number} for ${formatCurrency(
            totals.balanceDue
          )} is due on ${formatDate(invoice.dueDate)}.`,
          ``,
          `Let us know if you have any questions about this invoice.`,
          ``,
          `Thanks,`,
          `${businessName}`,
        ].join("\n"),
      };
    case "overdue_notice":
      return {
        subject: `Overdue: Invoice ${invoice.number} — action required`,
        body: [
          `Hi ${invoice.customerName},`,
          ``,
          `Our records show invoice ${invoice.number} for ${formatCurrency(
            totals.balanceDue
          )} was due on ${formatDate(invoice.dueDate)} and remains unpaid.`,
          ``,
          `Could you please arrange payment as soon as possible? If you've already paid, please disregard this notice.`,
          ``,
          `Thanks,`,
          `${businessName}`,
        ].join("\n"),
      };
    case "thank_you_payment":
      return {
        subject: `Payment received — thank you (Invoice ${invoice.number})`,
        body: [
          `Hi ${invoice.customerName},`,
          ``,
          `Thank you, we've received your payment of ${formatCurrency(
            invoice.amountPaid
          )} for invoice ${invoice.number}.`,
          ``,
          `We appreciate your business.`,
          ``,
          `${businessName}`,
        ].join("\n"),
      };
  }
}

export function buildQuoteFollowUpDraft(
  quote: Quote,
  business: Business
): { subject: string; body: string } {
  const businessName = business.name || "Your business";
  return {
    subject: `Following up on quote ${quote.number}`,
    body: [
      `Hi ${quote.customerName},`,
      ``,
      `Just checking in on quote ${quote.number}, sent ${formatDate(quote.issueDate)} and valid until ${formatDate(
        quote.expiryDate
      )}.`,
      ``,
      `Happy to answer any questions or adjust the scope — just let us know.`,
      ``,
      `Thanks,`,
      `${businessName}`,
    ].join("\n"),
  };
}
