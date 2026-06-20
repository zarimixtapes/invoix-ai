import { LineItem } from "./types";
import { emptyLineItem } from "./calculations";

export interface ParsedInvoiceDraft {
  customerName: string;
  lineItems: LineItem[];
  dueInDays: number;
  taxRate: number;
  taxInclusive: boolean;
  notes: string;
}

/**
 * Deterministic, dependency-free parser used whenever OPENAI_API_KEY is not
 * configured. It is intentionally rule-based (not "AI") but is built to
 * understand the kind of plain-English invoice instructions this product is
 * designed around, e.g.:
 *
 *   "Create an invoice for ABC Plumbing for 4 hours labour at $85 per hour,
 *    2 replacement parts at $45 each, due in 7 days, GST included."
 */
export function parseInvoiceInstruction(raw: string): ParsedInvoiceDraft {
  const text = raw.trim();
  const lower = text.toLowerCase();

  const customerName = extractCustomerName(text);
  const dueInDays = extractDueInDays(lower);
  const taxInclusive = /gst included|tax included|incl\.?\s*gst|including gst/.test(
    lower
  );
  const taxExempt = /no gst|gst free|gst exempt|excluding gst|tax exempt/.test(
    lower
  );
  const taxRate = taxExempt ? 0 : 10;

  const lineItems = extractLineItems(text, taxRate);

  return {
    customerName,
    lineItems: lineItems.length
      ? lineItems
      : [emptyLineItem({ description: "Service", quantity: 1, unitPrice: 0, taxRate })],
    dueInDays,
    taxRate,
    taxInclusive,
    notes: taxInclusive
      ? "Prices include GST."
      : taxExempt
      ? "This invoice is GST free."
      : "Prices are exclusive of GST; GST added per line item.",
  };
}

function extractCustomerName(text: string): string {
  // "for ABC Plumbing" — stop at the next clause boundary (comma, " for ", digits, "due", etc.)
  const m = text.match(
    /\bfor\s+([A-Z][A-Za-z0-9&'.\-\s]{1,60}?)(?:\s+for\s+|,|\.|\s+\d|\s+due\b|\s+at\b|$)/
  );
  if (m && m[1]) {
    return m[1].trim();
  }
  return "New Customer";
}

function extractDueInDays(lower: string): number {
  const m = lower.match(/due\s+in\s+(\d{1,3})\s*day/);
  if (m) return parseInt(m[1], 10);
  if (/due\s+on\s+receipt|due\s+immediately/.test(lower)) return 0;
  return 7;
}

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

function toNumber(token: string): number {
  const clean = token.replace(/,/g, "").trim().toLowerCase();
  if (NUMBER_WORDS[clean] !== undefined) return NUMBER_WORDS[clean];
  const n = parseFloat(clean);
  return Number.isNaN(n) ? 1 : n;
}

/**
 * Finds patterns like:
 *   "4 hours labour at $85 per hour"
 *   "2 replacement parts at $45 each"
 *   "3 callouts @ $60"
 *   "10 units of decking screws $4.50 each"
 */
function extractLineItems(text: string, defaultTaxRate: number): LineItem[] {
  const items: LineItem[] = [];
  const pattern =
    /(\d+(?:\.\d+)?|one|two|three|four|five|six|seven|eight|nine|ten)\s+([a-zA-Z][a-zA-Z\s\-/]*?)\s+(?:at|@|for)\s*\$?\s*(\d+(?:\.\d+)?)\s*(?:per\s+\w+|each|\/\w+|flat)?/gi;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const quantity = toNumber(match[1]);
    let description = match[2].trim().replace(/\s+/g, " ");
    description = description.replace(/^(of|x)\s+/i, "");
    description = capitalize(description);
    const unitPrice = parseFloat(match[3]);

    if (!description || Number.isNaN(unitPrice)) continue;

    items.push(
      emptyLineItem({
        description,
        quantity,
        unitPrice,
        taxRate: defaultTaxRate,
      })
    );
  }

  return items;
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
