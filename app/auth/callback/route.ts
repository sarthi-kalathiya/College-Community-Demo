import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getAuthRedirectPath } from "@/lib/auth-redirect"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // If next is specified, use it, otherwise determine based on user role
      if (next) {
        return NextResponse.redirect(`${origin}${next}`)
      }
      const redirectPath = await getAuthRedirectPath()
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  // Return to error page if code exchange fails
  return NextResponse.redirect(`${origin}/auth/error?message=Could not verify email`)
}
