"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Users } from "lucide-react"
import { CreateCommunityDialog } from "@/components/dashboard/create-community-dialog"
import type { Membership } from "@/lib/types"

interface MyCommunitiesProps {
  memberships: Membership[]
}

export function MyCommunities({ memberships }: MyCommunitiesProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">My Communities</h2>
          <p className="text-sm text-muted-foreground">Communities you&apos;ve created and manage</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Community
        </Button>
      </div>

      {memberships.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-medium">No communities yet</h3>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Create your first community and start building your tribe
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Community
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {memberships.map((membership) => (
            <CommunityCard key={membership.id} membership={membership} isOwner />
          ))}
        </div>
      )}

      <CreateCommunityDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  )
}

function CommunityCard({ membership, isOwner }: { membership: Membership; isOwner?: boolean }) {
  const community = membership.community
  if (!community) return null

  const isFree = community.price_in_cents === 0

  return (
    <Card className="group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <div className="aspect-video relative overflow-hidden bg-muted">
        {community.image_url ? (
          <img
            src={community.image_url || "/placeholder.svg"}
            alt={community.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <Users className="h-12 w-12 text-primary/40" />
          </div>
        )}
        <Badge variant={isFree ? "secondary" : "default"} className="absolute right-3 top-3">
          {isFree ? "Free" : `$${(community.price_in_cents / 100).toFixed(2)}/mo`}
        </Badge>
      </div>

      <CardHeader className="pb-2">
        <h3 className="font-semibold leading-tight line-clamp-1">{community.name}</h3>
        {community.description && <p className="text-sm text-muted-foreground line-clamp-2">{community.description}</p>}
      </CardHeader>

      <CardFooter className="mt-auto flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{community.member_count || 0} members</span>
        </div>
        <Button size="sm" asChild>
          <Link href={`/community/${community.id}`}>Open</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
