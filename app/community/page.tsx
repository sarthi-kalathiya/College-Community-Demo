import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CommunitiesExplorer } from "@/components/community/explorer"
import { DashboardHeader } from "@/components/dashboard/header"

export default async function CommunityExplorerPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Fetch user profile for header
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const isAdmin = profile?.role === "admin"

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader user={user} profile={profile} isAdmin={isAdmin} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Explore Communities</h1>
          <p className="text-muted-foreground">Discover and join communities that interest you</p>
        </div>
        <CommunitiesExplorer />
      </main>
    </div>
  )
}

