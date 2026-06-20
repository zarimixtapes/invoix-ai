import { NextRequest, NextResponse } from "next/server";
import { EmailDraftType, Invoice, Quote, Business } from "@/lib/types";
import { buildInvoiceEmailDraft, buildQuoteFollowUpDraft } from "@/lib/email-templates";

export const runtime = "nodejs";

interface RequestBody {
  type: EmailDraftType;
  business: Business;
  invoice?: Invoice;
  quote?: Quote;
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { type, business, invoice, quote } = body;

  if (!type || !business) {
    return NextResponse.json({ error: "Fields 'type' and 'business' are required." }, { status: 400 });
  }

  try {
    if (type === "quote_follow_up") {
      if (!quote) return NextResponse.json({ error: "Field 'quote' is required for this type." }, { status: 400 });
      const draft = buildQuoteFollowUpDraft(quote, business);
      return NextResponse.json({ ...draft, recipientEmail: quote.customerEmail });
    }

    if (!invoice) {
      return NextResponse.json({ error: "Field 'invoice' is required for this type." }, { status: 400 });
    }

    const draft = buildInvoiceEmailDraft(
      type as "send_invoice" | "payment_reminder" | "overdue_notice" | "thank_you_payment",
      invoice,
      business
    );
    return NextResponse.json({ ...draft, recipientEmail: invoice.customerEmail });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate email draft." },
      { status: 500 }
    );
  }
}
