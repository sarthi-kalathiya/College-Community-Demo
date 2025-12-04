"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MyCommunities } from "@/components/dashboard/my-communities"
import { JoinedCommunities } from "@/components/dashboard/joined-communities"
import { ExploreCommunities } from "@/components/dashboard/explore-communities"
import type { Membership } from "@/lib/types"

interface DashboardTabsProps {
  myCommunities: Membership[]
  joinedCommunities: Membership[]
}

export function DashboardTabs({ myCommunities, joinedCommunities }: DashboardTabsProps) {
  return (
    <Tabs defaultValue="explore" className="space-y-6">
      <TabsList className="grid w-full max-w-2xl grid-cols-3">
        <TabsTrigger value="explore">Explore</TabsTrigger>
        <TabsTrigger value="my-communities">My Communities ({myCommunities.length})</TabsTrigger>
        <TabsTrigger value="joined">Joined ({joinedCommunities.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="explore">
        <ExploreCommunities />
      </TabsContent>

      <TabsContent value="my-communities">
        <MyCommunities memberships={myCommunities} />
      </TabsContent>

      <TabsContent value="joined">
        <JoinedCommunities memberships={joinedCommunities} />
      </TabsContent>
    </Tabs>
  )
}
