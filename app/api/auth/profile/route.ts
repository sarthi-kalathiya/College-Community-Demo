import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get profile with community counts
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Get joined communities count
    const { count: joinedCount } = await supabase
      .from("memberships")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    // Get created communities count
    const { count: createdCount } = await supabase
      .from("communities")
      .select("*", { count: "exact", head: true })
      .eq("creator_id", user.id)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email!,
        name: profile.display_name,
        role: profile.role || "user",
        avatar: profile.avatar_url,
        bio: profile.bio,
        joinedCommunities: joinedCount || 0,
        createdCommunities: createdCount || 0,
      },
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, email, avatar, bio } = await request.json()

    const updateData: Record<string, string> = {}
    if (name !== undefined) updateData.display_name = name
    if (email !== undefined) updateData.email = email
    if (avatar !== undefined) updateData.avatar_url = avatar
    if (bio !== undefined) updateData.bio = bio
    updateData.updated_at = new Date().toISOString()

    const { data: profile, error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: profile.email,
        name: profile.display_name,
        role: profile.role || "user",
        avatar: profile.avatar_url,
        bio: profile.bio,
      },
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
