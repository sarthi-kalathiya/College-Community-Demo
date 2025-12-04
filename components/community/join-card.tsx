"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Lock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Community } from "@/lib/types"

interface JoinCommunityCardProps {
  community: Community
  userId: string
}

export function JoinCommunityCard({ community, userId }: JoinCommunityCardProps) {
  const [isJoining, setIsJoining] = useState(false)
  const router = useRouter()

  const isFree = community.price_in_cents === 0

  const handleJoin = async () => {
    if (!isFree) {
      // For paid communities, redirect to checkout (implemented in next task)
      router.push(`/community/${community.id}/checkout`)
      return
    }

    setIsJoining(true)
    const supabase = createClient()

    await supabase.from("memberships").insert({
      user_id: userId,
      community_id: community.id,
      role: "member",
    })

    router.refresh()
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader className="text-center">
          {community.image_url ? (
            <img
              src={community.image_url || "/placeholder.svg"}
              alt={community.name}
              className="mx-auto mb-4 h-24 w-24 rounded-xl object-cover"
            />
          ) : (
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-12 w-12 text-primary" />
            </div>
          )}
          <CardTitle className="text-2xl">{community.name}</CardTitle>
          {community.description && <CardDescription className="mt-2">{community.description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Membership</p>
              <p className="text-sm text-muted-foreground">{isFree ? "Free to join" : "Paid subscription"}</p>
            </div>
            <div className="text-right">
              {isFree ? (
                <p className="text-2xl font-bold text-primary">Free</p>
              ) : (
                <>
                  <p className="text-2xl font-bold">${(community.price_in_cents / 100).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">per month</p>
                </>
              )}
            </div>
          </div>

          <Button className="w-full" size="lg" onClick={handleJoin} disabled={isJoining}>
            {isJoining ? (
              "Joining..."
            ) : isFree ? (
              <>
                <Users className="mr-2 h-4 w-4" />
                Join Community
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Subscribe to Join
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
