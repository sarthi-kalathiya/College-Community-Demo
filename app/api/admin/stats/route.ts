import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const supabase = await createClient()

    // Get total users
    const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

    // Get total communities
    const { count: totalCommunities } = await supabase
      .from("communities")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")

    // Get total revenue from transactions
    const { data: revenueData } = await supabase.from("transactions").select("amount_in_cents")

    const totalRevenue = revenueData?.reduce((sum, t) => sum + t.amount_in_cents, 0) || 0

    // Get recent signups (last 7 days)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const { count: recentSignups } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo.toISOString())

    // Get active communities (with posts in last 30 days)
    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 30)
    const { data: activeCommData } = await supabase
      .from("posts")
      .select("community_id")
      .gte("created_at", monthAgo.toISOString())

    const activeCommunities = new Set(activeCommData?.map((p) => p.community_id)).size

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalCommunities: totalCommunities || 0,
      totalRevenue: totalRevenue / 100, // Convert to dollars
      recentSignups: recentSignups || 0,
      activeCommunities,
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
