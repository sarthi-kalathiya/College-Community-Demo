import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { CommunityHeader } from "@/components/community/header"
import { CommunityContent } from "@/components/community/content"
import type { Community, Membership, LeaderboardEntry, Profile } from "@/lib/types"

interface CommunityPageProps {
  params: Promise<{ id: string }>
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  // Parallelize all data fetching for better performance
  const [communityResult, membershipResult, membersResult, leaderboardResult, userProfileResult] = await Promise.all([
    // Fetch community details (only essential creator fields)
    supabase
      .from("communities")
      .select(`
        *,
        creator:profiles!communities_creator_id_fkey(id, display_name, avatar_url)
      `)
      .eq("id", id)
      .single(),
    
    // Check if user is a member
    supabase
      .from("memberships")
      .select("id, role, joined_at")
      .eq("community_id", id)
      .eq("user_id", user.id)
      .single(),
    
    // Fetch members list (limited to 20 for faster loading, only essential fields)
    supabase
      .from("memberships")
      .select(`
        id,
        role,
        joined_at,
        profile:profiles(id, display_name, avatar_url)
      `)
      .eq("community_id", id)
      .order("joined_at", { ascending: true })
      .limit(20),
    
    // Fetch leaderboard
    supabase.rpc("get_community_leaderboard", {
      community_uuid: id,
      limit_count: 10,
    }),
    
    // Get user's profile (only essential fields)
    supabase
      .from("profiles")
      .select("id, display_name, avatar_url, bio")
      .eq("id", user.id)
      .single(),
  ])

  const { data: community, error } = communityResult
  if (error || !community) notFound()

  const { data: membership } = membershipResult
  const { data: members } = membersResult
  const { data: leaderboard } = leaderboardResult
  const { data: userProfile } = userProfileResult

  // If not a member and community requires payment, show join page
  const isCreator = community.creator_id === user.id
  const isMember = !!membership || isCreator

  return (
    <div className="min-h-screen bg-muted/30">
      <CommunityHeader
        community={community as Community}
        isMember={isMember}
        isCreator={isCreator}
        membership={membership as Membership | null}
        user={user}
      />
      <CommunityContent
        community={community as Community}
        members={(members || [])
          .filter((m) => m.profile !== null && m.profile !== undefined)
          .map((m) => {
            const profile = Array.isArray(m.profile) ? m.profile[0] : m.profile
            if (!profile || typeof profile !== 'object' || !('id' in profile)) {
              return null
            }
            return {
              id: (profile as { id: string }).id || "",
              email: "",
              display_name: (profile as { display_name?: string }).display_name || "",
              avatar_url: (profile as { avatar_url?: string | null }).avatar_url || null,
              bio: null,
              role: "user" as const,
              created_at: "",
              updated_at: "",
            } as Profile
          })
          .filter((p): p is Profile => p !== null)}
        leaderboard={(leaderboard || []) as LeaderboardEntry[]}
        isMember={isMember}
        isCreator={isCreator}
        userId={user.id}
        userProfile={userProfile as Profile}
      />
    </div>
  )
}
