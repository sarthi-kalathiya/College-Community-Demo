import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { CheckoutForm } from "@/components/community/checkout-form"

interface CheckoutPageProps {
  params: Promise<{ id: string }>
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Fetch community details
  const { data: community, error } = await supabase.from("communities").select("*").eq("id", id).single()

  if (error || !community) notFound()

  // If free community, redirect to community page
  if (community.price_in_cents === 0) {
    redirect(`/community/${id}`)
  }

  // Check if already a member
  const { data: membership } = await supabase
    .from("memberships")
    .select("id")
    .eq("community_id", id)
    .eq("user_id", user.id)
    .single()

  if (membership) {
    redirect(`/community/${id}`)
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <CheckoutForm community={community} />
    </div>
  )
}
