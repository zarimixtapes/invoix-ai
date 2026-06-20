import { NextRequest, NextResponse } from "next/server";
import { parseInvoiceInstruction } from "@/lib/ai-parser";

export const runtime = "nodejs";

interface RequestBody {
  instruction: string;
  taxDefault?: number;
}

const SYSTEM_PROMPT = `You are an assistant that converts a plain-English business instruction into a structured invoice draft.
Return ONLY valid JSON matching exactly this shape, with no markdown fences and no extra commentary:
{
  "customerName": string,
  "lineItems": [{ "description": string, "quantity": number, "unitPrice": number, "taxRate": number }],
  "dueInDays": number,
  "taxRate": number,
  "taxInclusive": boolean,
  "notes": string
}
Infer reasonable values for anything not explicitly stated. Default taxRate to 10 (Australian GST) unless the
instruction says GST free / tax exempt, in which case use 0. Default dueInDays to 7 if not specified.`;

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const instruction = (body.instruction || "").trim();
  if (!instruction) {
    return NextResponse.json({ error: "Field 'instruction' is required." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const fallback = parseInvoiceInstruction(instruction);
    return NextResponse.json({
      mode: "fallback",
      draft: fallback,
      message:
        "Generated using the built-in demo parser. Add OPENAI_API_KEY to enable full AI understanding in production mode.",
    });
  }

  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: instruction },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from OpenAI.");

    const parsed = JSON.parse(content);

    return NextResponse.json({
      mode: "openai",
      draft: {
        customerName: parsed.customerName || "New Customer",
        lineItems: Array.isArray(parsed.lineItems)
          ? parsed.lineItems.map((li: Record<string, unknown>, idx: number) => ({
              id: `li_ai_${idx}_${Date.now()}`,
              description: String(li.description || "Item"),
              quantity: Number(li.quantity) || 1,
              unitPrice: Number(li.unitPrice) || 0,
              taxRate: Number(li.taxRate ?? body.taxDefault ?? 10),
            }))
          : [],
        dueInDays: Number(parsed.dueInDays) || 7,
        taxRate: Number(parsed.taxRate ?? 10),
        taxInclusive: Boolean(parsed.taxInclusive),
        notes: String(parsed.notes || ""),
      },
    });
  } catch (err) {
    // If OpenAI fails for any reason (bad key, network, rate limit), don't break
    // the user's workflow — fall back to deterministic parsing transparently.
    const fallback = parseInvoiceInstruction(instruction);
    return NextResponse.json({
      mode: "fallback",
      draft: fallback,
      message:
        "Couldn't reach OpenAI, so this draft was generated using the built-in demo parser instead. " +
        (err instanceof Error ? err.message : ""),
    });
  }
}
