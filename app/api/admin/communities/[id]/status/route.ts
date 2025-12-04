import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/admin"
import { NextResponse } from "next/server"

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

    const supabase = await createClient()

    const { data: community, error } = await supabase
      .from("communities")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, status")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ community })
  } catch (error) {
    console.error("Update community status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
