import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardTabs } from "@/components/dashboard/tabs"
import type { Membership } from "@/lib/types"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch user's memberships with community details
  const { data: memberships } = await supabase
    .from("memberships")
    .select(`
      *,
      community:communities(
        *,
        creator:profiles!communities_creator_id_fkey(id, display_name, avatar_url),
        memberships(count)
      )
    `)
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false })

  // Fetch user's journal entries
  const { data: journalEntries } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)

  const formattedMemberships: Membership[] = (memberships || []).map((m) => ({
    ...m,
    community: m.community
      ? {
          ...m.community,
          member_count: m.community.memberships?.[0]?.count || 0,
        }
      : undefined,
  }))

  const myCommunities = formattedMemberships.filter((m) => m.role === "creator")
  const joinedCommunities = formattedMemberships.filter((m) => m.role === "member")

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader user={user} profile={profile} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {profile?.display_name || user.email?.split("@")[0]}</h1>
          <p className="text-muted-foreground">Manage your communities and journal entries</p>
        </div>

        <DashboardTabs
          myCommunities={myCommunities}
          joinedCommunities={joinedCommunities}
          journalEntries={journalEntries || []}
          userId={user.id}
        />
      </main>
    </div>
  )
}
