"use server"

import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

export async function createCommunityCheckoutSession(communityId: string) {
  const supabase = await createClient()

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("You must be logged in to subscribe")
  }

  // Get community details
  const { data: community, error } = await supabase.from("communities").select("*").eq("id", communityId).single()

  if (error || !community) {
    throw new Error("Community not found")
  }

  if (community.price_in_cents === 0) {
    throw new Error("This community is free to join")
  }

  // Check if already a member
  const { data: existingMembership } = await supabase
    .from("memberships")
    .select("id")
    .eq("community_id", communityId)
    .eq("user_id", user.id)
    .single()

  if (existingMembership) {
    throw new Error("You are already a member of this community")
  }

  // Create Stripe checkout session for subscription
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${community.name} Membership`,
            description: community.description || `Monthly membership to ${community.name}`,
          },
          unit_amount: community.price_in_cents,
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      },
    ],
    mode: "subscription",
    metadata: {
      community_id: communityId,
      user_id: user.id,
    },
  })

  return session.client_secret
}

export async function handleSuccessfulPayment(sessionId: string) {
  const supabase = await createClient()

  // Retrieve the session from Stripe
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (session.payment_status !== "paid") {
    throw new Error("Payment not completed")
  }

  const communityId = session.metadata?.community_id
  const userId = session.metadata?.user_id

  if (!communityId || !userId) {
    throw new Error("Invalid session metadata")
  }

  // Check if already a member (avoid duplicates)
  const { data: existingMembership } = await supabase
    .from("memberships")
    .select("id")
    .eq("community_id", communityId)
    .eq("user_id", userId)
    .single()

  if (existingMembership) {
    return { success: true, alreadyMember: true }
  }

  // Create membership
  const { error } = await supabase.from("memberships").insert({
    user_id: userId,
    community_id: communityId,
    role: "member",
    stripe_subscription_id: session.subscription as string,
  })

  if (error) {
    throw new Error("Failed to create membership")
  }

  return { success: true }
}
