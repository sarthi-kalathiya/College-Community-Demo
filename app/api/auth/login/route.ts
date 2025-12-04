import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (!data.user || !data.session) {
      return NextResponse.json({ error: "Failed to authenticate" }, { status: 401 })
    }

    // Get profile data
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email!,
        name: profile?.display_name || data.user.email!.split("@")[0],
        role: profile?.role || "user",
        avatar: profile?.avatar_url,
      },
      token: data.session.access_token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
