import { createClient } from "@/lib/supabase/server"

/**
 * Determines the redirect path after authentication based on user role
 * Admins go to /admin, regular users go to /dashboard
 */
export async function getAuthRedirectPath(): Promise<string> {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user) {
    return "/auth/login"
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  return profile?.role === "admin" ? "/admin" : "/dashboard"
}

