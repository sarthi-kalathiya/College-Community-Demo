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
    const role = searchParams.get("role") || ""
    const limit = 20
    const offset = (page - 1) * limit

    const supabase = await createClient()

    let query = supabase.from("profiles").select("*, memberships(count)", { count: "exact" })

    if (search) {
      query = query.or(`display_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (role) {
      query = query.eq("role", role)
    }

    const {
      data: profiles,
      count,
      error,
    } = await query.order("created_at", { ascending: false }).range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const users =
      profiles?.map((p) => ({
        id: p.id,
        name: p.display_name,
        email: p.email,
        role: p.role || "user",
        communitiesCount: p.memberships?.[0]?.count || 0,
        joinedAt: p.created_at,
      })) || []

    return NextResponse.json({
      users,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error("Admin users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
