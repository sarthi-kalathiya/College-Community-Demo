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
  if (!user) redirect("/auth/login")

  // Fetch community details
  const { data: community, error } = await supabase
    .from("communities")
    .select(`
      *,
      creator:profiles!communities_creator_id_fkey(*)
    `)
    .eq("id", id)
    .single()

  if (error || !community) notFound()

  // Check if user is a member
  const { data: membership } = await supabase
    .from("memberships")
    .select("*")
    .eq("community_id", id)
    .eq("user_id", user.id)
    .single()

  // If not a member and community requires payment, show join page
  const isCreator = community.creator_id === user.id
  const isMember = !!membership || isCreator

  // Fetch members list
  const { data: members } = await supabase
    .from("memberships")
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq("community_id", id)
    .order("joined_at", { ascending: true })
    .limit(50)

  // Fetch leaderboard
  const { data: leaderboard } = await supabase.rpc("get_community_leaderboard", {
    community_uuid: id,
    limit_count: 10,
  })

  // Get user's profile
  const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

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
        members={(members || []).map((m) => m.profile as Profile)}
        leaderboard={(leaderboard || []) as LeaderboardEntry[]}
        isMember={isMember}
        isCreator={isCreator}
        userId={user.id}
        userProfile={userProfile as Profile}
      />
    </div>
  )
}
