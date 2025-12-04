import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(".supabase.co", "")}.vercel.app/auth/callback`,
        data: {
          display_name: name || email.split("@")[0],
        },
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    const needsEmailConfirmation = !data.session

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email!,
        name: name || email.split("@")[0],
        role: "user",
      },
      token: data.session?.access_token || null,
      needsEmailConfirmation,
      message: needsEmailConfirmation
        ? "Please check your email to confirm your account"
        : "Account created successfully",
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
