import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const priceId   = process.env.STRIPE_PRO_PRICE_ID;

  if (!stripeKey || !priceId) {
    return NextResponse.json(
      { error: "Stripe not configured — add STRIPE_SECRET_KEY and STRIPE_PRO_PRICE_ID to env vars" },
      { status: 503 }
    );
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey);

    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/pricing?success=true`,
      cancel_url:  `${origin}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Stripe error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
