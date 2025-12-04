import { headers } from "next/headers"
import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  // Use service role for webhook processing - create client at runtime
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 })
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    // Note: In production, you should set up a webhook secret
    // For now, we'll parse the event directly
    event = JSON.parse(body) as Stripe.Event
  } catch (err) {
    console.error("Webhook error:", err)
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session

      if (session.payment_status === "paid" && session.metadata) {
        const { community_id, user_id } = session.metadata

        if (community_id && user_id) {
          // Check if membership already exists
          const { data: existing } = await supabaseAdmin
            .from("memberships")
            .select("id")
            .eq("community_id", community_id)
            .eq("user_id", user_id)
            .single()

          if (!existing) {
            await supabaseAdmin.from("memberships").insert({
              user_id,
              community_id,
              role: "member",
              stripe_subscription_id: session.subscription as string,
            })
          }
        }
      }
      break
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription

      // Remove membership when subscription is cancelled
      await supabaseAdmin.from("memberships").delete().eq("stripe_subscription_id", subscription.id)

      break
    }
  }

  return NextResponse.json({ received: true })
}
