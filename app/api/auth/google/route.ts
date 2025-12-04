import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { googleToken } = await request.json()

    if (!googleToken) {
      return NextResponse.json({ error: "Google token is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: googleToken,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (!data.user || !data.session) {
      return NextResponse.json({ error: "Failed to authenticate with Google" }, { status: 401 })
    }

    // Get or create profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email!,
        name: profile?.display_name || data.user.user_metadata?.full_name || data.user.email!.split("@")[0],
        role: profile?.role || "user",
      },
      token: data.session.access_token,
    })
  } catch (error) {
    console.error("Google auth error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
