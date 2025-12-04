"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CommunityFeed } from "@/components/community/feed"
import { MembersList } from "@/components/community/members-list"
import { Leaderboard } from "@/components/community/leaderboard"
import { JoinCommunityCard } from "@/components/community/join-card"
import type { Community, LeaderboardEntry, Profile } from "@/lib/types"

interface CommunityContentProps {
  community: Community
  members: Profile[]
  leaderboard: LeaderboardEntry[]
  isMember: boolean
  isCreator: boolean
  userId: string
  userProfile: Profile
}

export function CommunityContent({
  community,
  members,
  leaderboard,
  isMember,
  isCreator,
  userId,
  userProfile,
}: CommunityContentProps) {
  if (!isMember) {
    return (
      <div className="container mx-auto px-4 py-8">
        <JoinCommunityCard community={community} userId={userId} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Tabs defaultValue="feed">
            <TabsList>
              <TabsTrigger value="feed">Feed</TabsTrigger>
              <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="mt-6">
              <CommunityFeed
                communityId={community.id}
                userId={userId}
                userProfile={userProfile}
                isCreator={isCreator}
              />
            </TabsContent>

            <TabsContent value="members" className="mt-6">
              <MembersList members={members} creatorId={community.creator_id} />
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="mb-2 font-semibold">About</h3>
            <p className="text-sm text-muted-foreground">{community.description || "No description provided."}</p>
          </div>

          <Leaderboard entries={leaderboard} />
        </aside>
      </div>
    </div>
  )
}
