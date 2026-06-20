// ─────────────────────────────────────────────────────────────
// Invoix AI v4 — shared types
// These mirror supabase/schema.sql so the demo (localStorage) and
// production (Supabase) data shapes stay identical.
// ─────────────────────────────────────────────────────────────

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
export type QuoteStatus = "draft" | "sent" | "accepted" | "declined" | "converted" | "expired";
export type SubscriptionPlan = "free" | "starter" | "pro";
export type SubscriptionState = "trialing" | "active" | "expired" | "past_due" | "cancelled";
export type DiscountType = "flat" | "percent";

export interface LineItem {
  id: string;
  productId?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // percent, e.g. 10 for 10% GST
}

export interface Business {
  id: string;
  name: string;
  abn: string;
  address: string;
  email: string;
  phone: string;
  logoDataUrl?: string | null;
  defaultTaxRate: number;
  defaultPaymentTerms: string;
  brandColor: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  nextQuoteNumber: number;
}

export interface Customer {
  id: string;
  name: string;
  businessName?: string;
  email: string;
  phone?: string;
  address?: string;
  abn?: string;
  notes?: string;
  createdAt: string;
}

export type ProductCategory =
  | "Labour"
  | "Parts"
  | "Materials"
  | "Service"
  | "Product"
  | "Other";

export interface ProductService {
  id: string;
  name: string;
  description?: string;
  unitPrice: number;
  taxRate: number;
  category: ProductCategory;
  createdAt: string;
}

export interface Invoice {
  id: string;
  number: string;
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
  status: InvoiceStatus;
  amountPaid: number;
  createdAt: string;
  updatedAt: string;
  sourceQuoteId?: string | null;
  aiGenerated?: boolean;
}

export interface Quote {
  id: string;
  number: string;
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
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
  convertedInvoiceId?: string | null;
}

export type EmailDraftType =
  | "send_invoice"
  | "payment_reminder"
  | "overdue_notice"
  | "quote_follow_up"
  | "thank_you_payment";

export interface EmailDraft {
  id: string;
  type: EmailDraftType;
  subject: string;
  recipientEmail: string;
  body: string;
  relatedInvoiceId?: string | null;
  relatedQuoteId?: string | null;
  status: "draft" | "sent";
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: string;
  receivedAt: string;
  notes?: string;
}

export interface Subscription {
  plan: SubscriptionPlan;
  state: SubscriptionState;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
}

export interface AiUsageRecord {
  id: string;
  prompt: string;
  createdAt: string;
  mode: "openai" | "fallback";
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  tone: "success" | "error" | "info";
}

export interface InvoiceTotals {
  subtotal: number;
  discountAmount: number;
  taxableBase: number;
  taxTotal: number;
  shipping: number;
  total: number;
  balanceDue: number;
}
