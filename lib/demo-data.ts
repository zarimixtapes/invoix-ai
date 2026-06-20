import {
  Business,
  Customer,
  Invoice,
  ProductService,
  Quote,
  Subscription,
} from "./types";
import { addDaysISO, todayISO } from "./format";
import { emptyLineItem } from "./calculations";

export const DEMO_BUSINESS: Business = {
  id: "biz_demo",
  name: "Harbour & Co. Trade Services",
  abn: "51 824 753 556",
  address: "12 Wattle Street, Newport NSW 2106",
  email: "billing@harbourtrade.example",
  phone: "0412 345 678",
  logoDataUrl: null,
  defaultTaxRate: 10,
  defaultPaymentTerms: "Payment due within 7 days of invoice date.",
  brandColor: "#0F9D87",
  invoicePrefix: "INV",
  nextInvoiceNumber: 1006,
  nextQuoteNumber: 1003,
};

export const DEMO_CUSTOMERS: Customer[] = [
  {
    id: "cust_1",
    name: "Amanda Ho",
    businessName: "ABC Plumbing",
    email: "amanda@abcplumbing.example",
    phone: "0400 111 222",
    address: "4 Marina Way, Newport NSW 2106",
    abn: "22 333 444 555",
    notes: "Preferred customer, pays fast.",
    createdAt: addDaysISO(-120),
  },
  {
    id: "cust_2",
    name: "Daniel Reyes",
    businessName: "Reyes Cleaning Co.",
    email: "daniel@reyescleaning.example",
    phone: "0411 222 333",
    address: "8 Bay Street, Mona Vale NSW 2103",
    abn: "",
    notes: "",
    createdAt: addDaysISO(-95),
  },
  {
    id: "cust_3",
    name: "Priya Natarajan",
    businessName: "",
    email: "priya.n@example.com",
    phone: "0422 333 444",
    address: "21 Hill Road, Avalon NSW 2107",
    abn: "",
    notes: "Found us via eBay storefront.",
    createdAt: addDaysISO(-60),
  },
  {
    id: "cust_4",
    name: "Marcus Webb",
    businessName: "Webb Electrical",
    email: "marcus@webbelectrical.example",
    phone: "0433 555 666",
    address: "100 Pittwater Rd, Manly NSW 2095",
    abn: "65 111 222 333",
    notes: "",
    createdAt: addDaysISO(-30),
  },
];

export const DEMO_PRODUCTS: ProductService[] = [
  {
    id: "prod_1",
    name: "Labour (hourly)",
    description: "Standard on-site labour rate",
    unitPrice: 85,
    taxRate: 10,
    category: "Labour",
    createdAt: addDaysISO(-150),
  },
  {
    id: "prod_2",
    name: "Replacement part",
    description: "Generic replacement part, see notes",
    unitPrice: 45,
    taxRate: 10,
    category: "Parts",
    createdAt: addDaysISO(-150),
  },
  {
    id: "prod_3",
    name: "Call-out fee",
    description: "Standard call-out / inspection fee",
    unitPrice: 60,
    taxRate: 10,
    category: "Service",
    createdAt: addDaysISO(-150),
  },
  {
    id: "prod_4",
    name: "Standard clean (3hr)",
    description: "Full residential clean, up to 3 hours",
    unitPrice: 180,
    taxRate: 10,
    category: "Service",
    createdAt: addDaysISO(-140),
  },
  {
    id: "prod_5",
    name: "Postage — small parcel",
    description: "Standard small parcel post",
    unitPrice: 12.5,
    taxRate: 10,
    category: "Other",
    createdAt: addDaysISO(-90),
  },
];

function inv(
  id: string,
  number: string,
  customer: Customer,
  status: Invoice["status"],
  issueDaysAgo: number,
  dueInDays: number,
  items: ReturnType<typeof emptyLineItem>[],
  amountPaid = 0,
  notes = ""
): Invoice {
  const issueDate = addDaysISO(-issueDaysAgo);
  return {
    id,
    number,
    customerId: customer.id,
    customerName: customer.businessName || customer.name,
    customerEmail: customer.email,
    customerAddress: customer.address || "",
    issueDate,
    dueDate: addDaysISO(dueInDays, issueDate),
    lineItems: items,
    discountType: "flat",
    discountValue: 0,
    shipping: 0,
    notes,
    paymentTerms: DEMO_BUSINESS.defaultPaymentTerms,
    status,
    amountPaid,
    createdAt: issueDate,
    updatedAt: issueDate,
    sourceQuoteId: null,
    aiGenerated: false,
  };
}

export const DEMO_INVOICES: Invoice[] = [
  inv(
    "inv_1001",
    "INV-1001",
    DEMO_CUSTOMERS[0],
    "paid",
    35,
    7,
    [
      emptyLineItem({ description: "Labour", quantity: 4, unitPrice: 85, taxRate: 10 }),
      emptyLineItem({ description: "Replacement part", quantity: 2, unitPrice: 45, taxRate: 10 }),
    ],
    517,
    "Thanks for the quick payment."
  ),
  inv(
    "inv_1002",
    "INV-1002",
    DEMO_CUSTOMERS[1],
    "paid",
    28,
    7,
    [emptyLineItem({ description: "Standard clean (3hr)", quantity: 1, unitPrice: 180, taxRate: 10 })],
    198
  ),
  inv(
    "inv_1003",
    "INV-1003",
    DEMO_CUSTOMERS[2],
    "sent",
    10,
    7,
    [
      emptyLineItem({ description: "Postage — small parcel", quantity: 3, unitPrice: 12.5, taxRate: 10 }),
      emptyLineItem({ description: "Handling fee", quantity: 1, unitPrice: 15, taxRate: 10 }),
    ],
    0
  ),
  inv(
    "inv_1004",
    "INV-1004",
    DEMO_CUSTOMERS[3],
    "overdue",
    20,
    7,
    [
      emptyLineItem({ description: "Labour", quantity: 6, unitPrice: 95, taxRate: 10 }),
      emptyLineItem({ description: "Call-out fee", quantity: 1, unitPrice: 60, taxRate: 10 }),
    ],
    0
  ),
  inv(
    "inv_1005",
    "INV-1005",
    DEMO_CUSTOMERS[0],
    "draft",
    1,
    7,
    [emptyLineItem({ description: "Labour", quantity: 2, unitPrice: 85, taxRate: 10 })],
    0
  ),
];

export const DEMO_QUOTES: Quote[] = [
  {
    id: "quo_1001",
    number: "QUO-1001",
    customerId: DEMO_CUSTOMERS[3].id,
    customerName: DEMO_CUSTOMERS[3].businessName || DEMO_CUSTOMERS[3].name,
    customerEmail: DEMO_CUSTOMERS[3].email,
    customerAddress: DEMO_CUSTOMERS[3].address || "",
    issueDate: addDaysISO(-6),
    expiryDate: addDaysISO(24),
    lineItems: [
      emptyLineItem({ description: "Switchboard upgrade", quantity: 1, unitPrice: 650, taxRate: 10 }),
      emptyLineItem({ description: "Labour", quantity: 5, unitPrice: 95, taxRate: 10 }),
    ],
    discountType: "flat",
    discountValue: 0,
    shipping: 0,
    notes: "Quote valid for 30 days.",
    status: "sent",
    createdAt: addDaysISO(-6),
    updatedAt: addDaysISO(-6),
    convertedInvoiceId: null,
  },
  {
    id: "quo_1002",
    number: "QUO-1002",
    customerId: DEMO_CUSTOMERS[2].id,
    customerName: DEMO_CUSTOMERS[2].businessName || DEMO_CUSTOMERS[2].name,
    customerEmail: DEMO_CUSTOMERS[2].email,
    customerAddress: DEMO_CUSTOMERS[2].address || "",
    issueDate: addDaysISO(-2),
    expiryDate: addDaysISO(28),
    lineItems: [
      emptyLineItem({ description: "Custom packaging x 50", quantity: 50, unitPrice: 2.4, taxRate: 10 }),
    ],
    discountType: "percent",
    discountValue: 5,
    shipping: 15,
    notes: "",
    status: "draft",
    createdAt: addDaysISO(-2),
    updatedAt: addDaysISO(-2),
    convertedInvoiceId: null,
  },
];

export const DEMO_SUBSCRIPTION: Subscription = {
  plan: "free",
  state: "trialing",
  trialEndsAt: addDaysISO(14),
  currentPeriodEnd: null,
};
