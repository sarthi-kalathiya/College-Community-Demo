import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const limit = 20
    const offset = (page - 1) * limit

    const supabase = await createClient()

    let query = supabase.from("communities").select(
      `
        *,
        creator:profiles!communities_creator_id_fkey(display_name),
        memberships(count)
      `,
      { count: "exact" },
    )

    if (search) {
      query = query.ilike("name", `%${search}%`)
    }

    if (status) {
      query = query.eq("status", status)
    }

    const {
      data: communities,
      count,
      error,
    } = await query.order("created_at", { ascending: false }).range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get revenue per community
    const communityIds = communities?.map((c) => c.id) || []
    const { data: transactions } = await supabase
      .from("transactions")
      .select("community_id, amount_in_cents")
      .in("community_id", communityIds)

    const revenueByComm: Record<string, number> = {}
    transactions?.forEach((t) => {
      revenueByComm[t.community_id] = (revenueByComm[t.community_id] || 0) + t.amount_in_cents
    })

    const result =
      communities?.map((c) => ({
        id: c.id,
        name: c.name,
        creator: c.creator?.display_name || "Unknown",
        memberCount: c.memberships?.[0]?.count || 0,
        revenue: (revenueByComm[c.id] || 0) / 100,
        status: c.status || "active",
      })) || []

    return NextResponse.json({
      communities: result,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error("Admin communities error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
