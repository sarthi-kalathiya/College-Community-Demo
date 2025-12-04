"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MyCommunities } from "@/components/dashboard/my-communities"
import { JoinedCommunities } from "@/components/dashboard/joined-communities"
import { JournalTab } from "@/components/dashboard/journal-tab"
import type { JournalEntry, Membership } from "@/lib/types"

interface DashboardTabsProps {
  myCommunities: Membership[]
  joinedCommunities: Membership[]
  journalEntries: JournalEntry[]
  userId: string
}

export function DashboardTabs({ myCommunities, joinedCommunities, journalEntries, userId }: DashboardTabsProps) {
  return (
    <Tabs defaultValue="my-communities" className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-3">
        <TabsTrigger value="my-communities">My Communities ({myCommunities.length})</TabsTrigger>
        <TabsTrigger value="joined">Joined ({joinedCommunities.length})</TabsTrigger>
        <TabsTrigger value="journal">Journal</TabsTrigger>
      </TabsList>

      <TabsContent value="my-communities">
        <MyCommunities memberships={myCommunities} />
      </TabsContent>

      <TabsContent value="joined">
        <JoinedCommunities memberships={joinedCommunities} />
      </TabsContent>

      <TabsContent value="journal">
        <JournalTab entries={journalEntries} userId={userId} />
      </TabsContent>
    </Tabs>
  )
}
