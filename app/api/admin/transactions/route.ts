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
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const limit = 20
    const offset = (page - 1) * limit

    const supabase = await createClient()

    let query = supabase.from("transactions").select(
      `
        *,
        user:profiles!transactions_user_id_fkey(display_name),
        community:communities!transactions_community_id_fkey(name)
      `,
      { count: "exact" },
    )

    if (startDate) {
      query = query.gte("created_at", startDate)
    }

    if (endDate) {
      query = query.lte("created_at", endDate)
    }

    const {
      data: transactions,
      count,
      error,
    } = await query.order("created_at", { ascending: false }).range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const result =
      transactions?.map((t) => ({
        id: t.id,
        amount: t.amount_in_cents / 100,
        communityName: t.community?.name || "Unknown",
        userName: t.user?.display_name || "Unknown",
        date: t.created_at,
        platformFee: t.platform_fee_in_cents / 100,
      })) || []

    return NextResponse.json({
      transactions: result,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error("Admin transactions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
