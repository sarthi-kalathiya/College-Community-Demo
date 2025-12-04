import { isAdmin } from "@/lib/admin"
import { NextResponse } from "next/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = await params
    const { status } = await request.json()

    if (!["active", "suspended", "deleted"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'active', 'suspended', or 'deleted'" },
        { status: 400 },
      )
    }

    // Use service role client for admin operations to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const supabaseAdmin = createServiceClient(supabaseUrl, supabaseServiceKey)

    const { data: community, error } = await supabaseAdmin
      .from("communities")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, status")
      .single()

    if (error) {
      console.error("Supabase update error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ community })
  } catch (error) {
    console.error("Update community status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
