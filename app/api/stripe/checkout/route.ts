import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface RequestBody {
  plan: "starter" | "pro";
  email?: string;
}

const PRICE_ENV: Record<RequestBody["plan"], string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
};

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = body.plan ? PRICE_ENV[body.plan] : undefined;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!secretKey || !priceId) {
    // Demo billing mode — no real Stripe call, the client should fall back
    // to simulated subscription state via the local store instead.
    return NextResponse.json({
      mode: "demo",
      message:
        "Stripe isn't configured yet, so this is running in demo billing mode. Add STRIPE_SECRET_KEY and price IDs to enable real checkout.",
    });
  }

  try {
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(secretKey);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: body.email,
      success_url: `${appUrl}/billing?checkout=success`,
      cancel_url: `${appUrl}/billing?checkout=cancelled`,
      subscription_data: {
        trial_period_days: 14,
      },
    });

    return NextResponse.json({ mode: "live", url: session.url });
  } catch (err) {
    return NextResponse.json(
      {
        mode: "error",
        error: err instanceof Error ? err.message : "Stripe checkout failed.",
      },
      { status: 500 }
    );
  }
}
