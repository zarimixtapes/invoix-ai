import { NextResponse } from 'next/server';

function fallback(text: string, language: string) {
  const amountMatch = text.match(/(?:\$|AUD|USD|£|€)?\s?(\d+(?:\.\d{1,2})?)/);
  const amount = amountMatch ? Number(amountMatch[1]) : 0;
  const nameMatch = text.match(/for\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i);
  return {
    customerName: nameMatch?.[1] || 'New Customer',
    customerPhone: '',
    customerEmail: '',
    invoiceLanguage: language,
    currency: 'AUD',
    dueDateText: text.toLowerCase().includes('friday') ? 'Next Friday' : '7 days',
    items: [{ description: text.replace(amountMatch?.[0] || '', '').trim() || 'Service provided', quantity: 1, unitPrice: amount }],
    notes: 'Thank you for your business.'
  };
}

export async function POST(req: Request) {
  const { text, language = 'English', currency = 'AUD' } = await req.json();

  if (!process.env.OPENAI_API_KEY) return NextResponse.json(fallback(text, language));

  const prompt = `Convert this invoice request into JSON only. Return:
{"customerName":"","customerPhone":"","customerEmail":"","invoiceLanguage":"","currency":"","dueDateText":"","items":[{"description":"","quantity":1,"unitPrice":0}],"notes":""}
Language: ${language}
Currency: ${currency}
Request: ${text}`;

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4.1-mini', input: prompt, temperature: 0.2 })
    });
    const data = await response.json();
    const output = data.output_text || data.output?.[0]?.content?.[0]?.text || '{}';
    return NextResponse.json(JSON.parse(output));
  } catch {
    return NextResponse.json(fallback(text, language));
  }
}
