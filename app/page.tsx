import { createClient } from "@/lib/supabase/server"
import { LandingHero } from "@/components/landing/hero"
import { LandingHeader } from "@/components/landing/header"
import { CommunitiesGrid } from "@/components/landing/communities-grid"
import { LandingFooter } from "@/components/landing/footer"
import type { Community } from "@/lib/types"

export default async function HomePage() {
  const supabase = await createClient()

  // Get current user for header
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: communities } = await supabase
    .from("communities")
    .select(`
      *,
      creator:profiles!communities_creator_id_fkey(id, display_name, avatar_url)
    `)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(12)

  const formattedCommunities: Community[] = await Promise.all(
    (communities || []).map(async (c) => {
      const { count } = await supabase
        .from("memberships")
        .select("*", { count: "exact", head: true })
        .eq("community_id", c.id)

      return {
        ...c,
        member_count: count || 0,
      }
    }),
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader user={user} />
      <main className="flex-1">
        <LandingHero />
        <CommunitiesGrid communities={formattedCommunities} />
      </main>
      <LandingFooter />
    </div>
  )
}
