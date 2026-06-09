import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  const stripeKey     = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body      = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey);

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as { customer_email?: string; client_reference_id?: string };
      const clerkId = session.client_reference_id;
      if (clerkId) {
        await pool.query(`UPDATE users SET plan = 'pro' WHERE clerk_id = $1`, [clerkId]);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as { metadata?: { clerk_id?: string } };
      const clerkId = sub.metadata?.clerk_id;
      if (clerkId) {
        await pool.query(`UPDATE users SET plan = 'free' WHERE clerk_id = $1`, [clerkId]);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
