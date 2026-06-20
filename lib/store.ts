"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  AiUsageRecord,
  AuditLogEntry,
  Business,
  Customer,
  EmailDraft,
  EmailDraftType,
  Invoice,
  InvoiceStatus,
  Payment,
  ProductService,
  Quote,
  QuoteStatus,
  Subscription,
  SubscriptionPlan,
} from "./types";
import { newId, todayISO, addDaysISO } from "./format";
import { getEffectiveInvoiceStatus, invoiceTotals } from "./calculations";
import {
  DEMO_BUSINESS,
  DEMO_CUSTOMERS,
  DEMO_INVOICES,
  DEMO_PRODUCTS,
  DEMO_QUOTES,
  DEMO_SUBSCRIPTION,
} from "./demo-data";

const STORE_VERSION = 1;
const STORAGE_KEY = "invoix-ai-v4-store";

interface AppState {
  hasHydrated: boolean;
  business: Business;
  customers: Customer[];
  products: ProductService[];
  invoices: Invoice[];
  quotes: Quote[];
  emailDrafts: EmailDraft[];
  payments: Payment[];
  subscription: Subscription;
  aiUsage: AiUsageRecord[];
  auditLogs: AuditLogEntry[];

  setHasHydrated: (v: boolean) => void;

  // Business
  updateBusiness: (patch: Partial<Business>) => void;

  // Customers
  addCustomer: (data: Omit<Customer, "id" | "createdAt">) => Customer;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Products
  addProduct: (data: Omit<ProductService, "id" | "createdAt">) => ProductService;
  updateProduct: (id: string, patch: Partial<ProductService>) => void;
  deleteProduct: (id: string) => void;

  // Invoices
  addInvoice: (
    data: Omit<Invoice, "id" | "number" | "createdAt" | "updatedAt">
  ) => Invoice;
  updateInvoice: (id: string, patch: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  duplicateInvoice: (id: string) => Invoice | null;
  setInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  recordPayment: (invoiceId: string, amount: number, method: string, notes?: string) => void;
  syncOverdueInvoices: () => void;

  // Quotes
  addQuote: (data: Omit<Quote, "id" | "number" | "createdAt" | "updatedAt">) => Quote;
  updateQuote: (id: string, patch: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;
  duplicateQuote: (id: string) => Quote | null;
  setQuoteStatus: (id: string, status: QuoteStatus) => void;
  convertQuoteToInvoice: (id: string) => Invoice | null;

  // Email drafts
  addEmailDraft: (data: Omit<EmailDraft, "id" | "createdAt">) => EmailDraft;
  updateEmailDraft: (id: string, patch: Partial<EmailDraft>) => void;
  deleteEmailDraft: (id: string) => void;
  markEmailSent: (id: string) => void;

  // AI usage
  recordAiUsage: (prompt: string, mode: "openai" | "fallback") => void;
  aiUsageThisMonth: () => number;
  invoicesThisMonth: () => number;

  // Subscription / plan gating
  setSubscription: (patch: Partial<Subscription>) => void;
  setPlan: (plan: SubscriptionPlan) => void;
  effectivePlanForFeatures: () => SubscriptionPlan;
  canCreateInvoice: () => boolean;
  canUseAi: () => boolean;
  canUseBranding: () => boolean;
  canUseAnalytics: () => boolean;
  canUsePaymentReminders: () => boolean;

  // Audit
  logAction: (action: string, entity: string, entityId: string) => void;

  // Reset
  resetToDemoData: () => void;
  clearAllData: () => void;
}

function sameMonth(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      business: DEMO_BUSINESS,
      customers: DEMO_CUSTOMERS,
      products: DEMO_PRODUCTS,
      invoices: DEMO_INVOICES,
      quotes: DEMO_QUOTES,
      emailDrafts: [],
      payments: [],
      subscription: DEMO_SUBSCRIPTION,
      aiUsage: [],
      auditLogs: [],

      setHasHydrated: (v) => set({ hasHydrated: v }),

      updateBusiness: (patch) =>
        set((s) => ({ business: { ...s.business, ...patch } })),

      // ───────── Customers ─────────
      addCustomer: (data) => {
        const customer: Customer = { ...data, id: newId("cust"), createdAt: todayISO() };
        set((s) => ({ customers: [customer, ...s.customers] }));
        get().logAction("create", "customer", customer.id);
        return customer;
      },
      updateCustomer: (id, patch) => {
        set((s) => ({
          customers: s.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        }));
        get().logAction("update", "customer", id);
      },
      deleteCustomer: (id) => {
        set((s) => ({ customers: s.customers.filter((c) => c.id !== id) }));
        get().logAction("delete", "customer", id);
      },

      // ───────── Products ─────────
      addProduct: (data) => {
        const product: ProductService = { ...data, id: newId("prod"), createdAt: todayISO() };
        set((s) => ({ products: [product, ...s.products] }));
        get().logAction("create", "product", product.id);
        return product;
      },
      updateProduct: (id, patch) => {
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        }));
        get().logAction("update", "product", id);
      },
      deleteProduct: (id) => {
        set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
        get().logAction("delete", "product", id);
      },

      // ───────── Invoices ─────────
      addInvoice: (data) => {
        const business = get().business;
        const number = `${business.invoicePrefix}-${business.nextInvoiceNumber}`;
        const now = todayISO();
        const invoice: Invoice = {
          ...data,
          id: newId("inv"),
          number,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({
          invoices: [invoice, ...s.invoices],
          business: { ...s.business, nextInvoiceNumber: s.business.nextInvoiceNumber + 1 },
        }));
        get().logAction("create", "invoice", invoice.id);
        return invoice;
      },
      updateInvoice: (id, patch) => {
        set((s) => ({
          invoices: s.invoices.map((inv) =>
            inv.id === id ? { ...inv, ...patch, updatedAt: todayISO() } : inv
          ),
        }));
        get().logAction("update", "invoice", id);
      },
      deleteInvoice: (id) => {
        set((s) => ({ invoices: s.invoices.filter((inv) => inv.id !== id) }));
        get().logAction("delete", "invoice", id);
      },
      duplicateInvoice: (id) => {
        const original = get().invoices.find((inv) => inv.id === id);
        if (!original) return null;
        const business = get().business;
        const number = `${business.invoicePrefix}-${business.nextInvoiceNumber}`;
        const now = todayISO();
        const copy: Invoice = {
          ...original,
          id: newId("inv"),
          number,
          status: "draft",
          amountPaid: 0,
          issueDate: now,
          dueDate: addDaysISO(7, now),
          createdAt: now,
          updatedAt: now,
          lineItems: original.lineItems.map((li) => ({ ...li, id: newId("li") })),
        };
        set((s) => ({
          invoices: [copy, ...s.invoices],
          business: { ...s.business, nextInvoiceNumber: s.business.nextInvoiceNumber + 1 },
        }));
        get().logAction("duplicate", "invoice", copy.id);
        return copy;
      },
      setInvoiceStatus: (id, status) => {
        set((s) => ({
          invoices: s.invoices.map((inv) =>
            inv.id === id ? { ...inv, status, updatedAt: todayISO() } : inv
          ),
        }));
        get().logAction("status_change", "invoice", id);
      },
      recordPayment: (invoiceId, amount, method, notes) => {
        const payment: Payment = {
          id: newId("pay"),
          invoiceId,
          amount,
          method,
          receivedAt: todayISO(),
          notes,
        };
        set((s) => {
          const invoices = s.invoices.map((inv) => {
            if (inv.id !== invoiceId) return inv;
            const newAmountPaid = Math.round((inv.amountPaid + amount) * 100) / 100;
            const totals = invoiceTotals({ ...inv, amountPaid: newAmountPaid });
            const status: InvoiceStatus = totals.balanceDue <= 0 ? "paid" : inv.status;
            return { ...inv, amountPaid: newAmountPaid, status, updatedAt: todayISO() };
          });
          return { invoices, payments: [payment, ...s.payments] };
        });
        get().logAction("payment", "invoice", invoiceId);
      },
      syncOverdueInvoices: () => {
        set((s) => ({
          invoices: s.invoices.map((inv) => {
            const effective = getEffectiveInvoiceStatus(inv);
            return effective !== inv.status ? { ...inv, status: effective } : inv;
          }),
        }));
      },

      // ───────── Quotes ─────────
      addQuote: (data) => {
        const business = get().business;
        const number = `QUO-${business.nextQuoteNumber}`;
        const now = todayISO();
        const quote: Quote = { ...data, id: newId("quo"), number, createdAt: now, updatedAt: now };
        set((s) => ({
          quotes: [quote, ...s.quotes],
          business: { ...s.business, nextQuoteNumber: s.business.nextQuoteNumber + 1 },
        }));
        get().logAction("create", "quote", quote.id);
        return quote;
      },
      updateQuote: (id, patch) => {
        set((s) => ({
          quotes: s.quotes.map((q) => (q.id === id ? { ...q, ...patch, updatedAt: todayISO() } : q)),
        }));
        get().logAction("update", "quote", id);
      },
      deleteQuote: (id) => {
        set((s) => ({ quotes: s.quotes.filter((q) => q.id !== id) }));
        get().logAction("delete", "quote", id);
      },
      duplicateQuote: (id) => {
        const original = get().quotes.find((q) => q.id === id);
        if (!original) return null;
        const business = get().business;
        const number = `QUO-${business.nextQuoteNumber}`;
        const now = todayISO();
        const copy: Quote = {
          ...original,
          id: newId("quo"),
          number,
          status: "draft",
          createdAt: now,
          updatedAt: now,
          convertedInvoiceId: null,
          lineItems: original.lineItems.map((li) => ({ ...li, id: newId("li") })),
        };
        set((s) => ({
          quotes: [copy, ...s.quotes],
          business: { ...s.business, nextQuoteNumber: s.business.nextQuoteNumber + 1 },
        }));
        get().logAction("duplicate", "quote", copy.id);
        return copy;
      },
      setQuoteStatus: (id, status) => {
        set((s) => ({
          quotes: s.quotes.map((q) => (q.id === id ? { ...q, status, updatedAt: todayISO() } : q)),
        }));
        get().logAction("status_change", "quote", id);
      },
      convertQuoteToInvoice: (id) => {
        const quote = get().quotes.find((q) => q.id === id);
        if (!quote) return null;
        const business = get().business;
        const number = `${business.invoicePrefix}-${business.nextInvoiceNumber}`;
        const now = todayISO();
        const invoice: Invoice = {
          id: newId("inv"),
          number,
          customerId: quote.customerId,
          customerName: quote.customerName,
          customerEmail: quote.customerEmail,
          customerAddress: quote.customerAddress,
          issueDate: now,
          dueDate: addDaysISO(7, now),
          lineItems: quote.lineItems.map((li) => ({ ...li, id: newId("li") })),
          discountType: quote.discountType,
          discountValue: quote.discountValue,
          shipping: quote.shipping,
          notes: quote.notes,
          paymentTerms: business.defaultPaymentTerms,
          status: "draft",
          amountPaid: 0,
          createdAt: now,
          updatedAt: now,
          sourceQuoteId: quote.id,
          aiGenerated: false,
        };
        set((s) => ({
          invoices: [invoice, ...s.invoices],
          quotes: s.quotes.map((q) =>
            q.id === id ? { ...q, status: "converted", convertedInvoiceId: invoice.id, updatedAt: now } : q
          ),
          business: { ...s.business, nextInvoiceNumber: s.business.nextInvoiceNumber + 1 },
        }));
        get().logAction("convert", "quote", id);
        return invoice;
      },

      // ───────── Email drafts ─────────
      addEmailDraft: (data) => {
        const draft: EmailDraft = { ...data, id: newId("email"), createdAt: todayISO() };
        set((s) => ({ emailDrafts: [draft, ...s.emailDrafts] }));
        get().logAction("create", "email_draft", draft.id);
        return draft;
      },
      updateEmailDraft: (id, patch) => {
        set((s) => ({
          emailDrafts: s.emailDrafts.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        }));
      },
      deleteEmailDraft: (id) => {
        set((s) => ({ emailDrafts: s.emailDrafts.filter((d) => d.id !== id) }));
      },
      markEmailSent: (id) => {
        set((s) => ({
          emailDrafts: s.emailDrafts.map((d) => (d.id === id ? { ...d, status: "sent" } : d)),
        }));
        get().logAction("send", "email_draft", id);
      },

      // ───────── AI usage ─────────
      recordAiUsage: (prompt, mode) => {
        const record: AiUsageRecord = { id: newId("ai"), prompt, createdAt: todayISO(), mode };
        set((s) => ({ aiUsage: [record, ...s.aiUsage] }));
      },
      aiUsageThisMonth: () => get().aiUsage.filter((u) => sameMonth(u.createdAt)).length,
      invoicesThisMonth: () => get().invoices.filter((i) => sameMonth(i.createdAt)).length,

      // ───────── Subscription / gating ─────────
      setSubscription: (patch) => set((s) => ({ subscription: { ...s.subscription, ...patch } })),
      setPlan: (plan) =>
        set((s) => ({ subscription: { ...s.subscription, plan, state: "active" } })),
      effectivePlanForFeatures: () => {
        const sub = get().subscription;
        // Trial grants full Pro-level access so people can evaluate every feature.
        if (sub.state === "trialing") return "pro";
        if (sub.state === "active") return sub.plan;
        return "free";
      },
      canCreateInvoice: () => {
        const plan = get().effectivePlanForFeatures();
        if (plan !== "free") return true;
        return get().invoicesThisMonth() < 5;
      },
      canUseAi: () => {
        const plan = get().effectivePlanForFeatures();
        if (plan === "pro") return true;
        if (plan === "free") return get().aiUsageThisMonth() < 3;
        return false; // starter plan does not include AI generator
      },
      canUseBranding: () => get().effectivePlanForFeatures() === "pro",
      canUseAnalytics: () => get().effectivePlanForFeatures() === "pro",
      canUsePaymentReminders: () => get().effectivePlanForFeatures() === "pro",

      // ───────── Audit ─────────
      logAction: (action, entity, entityId) => {
        const entry: AuditLogEntry = { id: newId("log"), action, entity, entityId, createdAt: todayISO() };
        set((s) => ({ auditLogs: [entry, ...s.auditLogs].slice(0, 500) }));
      },

      // ───────── Reset ─────────
      resetToDemoData: () => {
        set({
          business: DEMO_BUSINESS,
          customers: DEMO_CUSTOMERS,
          products: DEMO_PRODUCTS,
          invoices: DEMO_INVOICES,
          quotes: DEMO_QUOTES,
          emailDrafts: [],
          payments: [],
          subscription: DEMO_SUBSCRIPTION,
          aiUsage: [],
          auditLogs: [],
        });
      },
      clearAllData: () => {
        set({
          business: { ...DEMO_BUSINESS, nextInvoiceNumber: 1001, nextQuoteNumber: 1001 },
          customers: [],
          products: [],
          invoices: [],
          quotes: [],
          emailDrafts: [],
          payments: [],
          subscription: { plan: "free", state: "trialing", trialEndsAt: addDaysISO(14), currentPeriodEnd: null },
          aiUsage: [],
          auditLogs: [],
        });
      },
    }),
    {
      name: STORAGE_KEY,
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      // If the persisted shape ever predates this version, fall back to fresh
      // demo data rather than risk crashing the app on a stale schema.
      migrate: (persistedState, version) => {
        if (version !== STORE_VERSION) {
          return undefined as unknown as AppState;
        }
        return persistedState as AppState;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => {
        const { hasHydrated, ...rest } = state;
        return rest;
      },
    }
  )
);
