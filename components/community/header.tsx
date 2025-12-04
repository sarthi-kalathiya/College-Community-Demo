"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Users, ArrowLeft, Settings, LogOut, MoreVertical, Crown } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Community, Membership } from "@/lib/types"
import type { User } from "@supabase/supabase-js"

interface CommunityHeaderProps {
  community: Community
  isMember: boolean
  isCreator: boolean
  membership: Membership | null
  user: User
}

export function CommunityHeader({ community, isMember, isCreator, membership, user }: CommunityHeaderProps) {
  const router = useRouter()

  const handleLeaveCommunity = async () => {
    if (!membership || isCreator) return

    const supabase = createClient()
    await supabase.from("memberships").delete().eq("id", membership.id)

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>

            <div className="flex items-center gap-3">
              {community.image_url ? (
                <img
                  src={community.image_url || "/placeholder.svg"}
                  alt={community.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-semibold">{community.name}</h1>
                  {isCreator && (
                    <Badge variant="secondary" className="text-xs">
                      <Crown className="mr-1 h-3 w-3" />
                      Creator
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {community.price_in_cents === 0
                    ? "Free community"
                    : `$${(community.price_in_cents / 100).toFixed(2)}/month`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isMember && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isCreator && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href={`/community/${community.id}/settings`}>
                          <Settings className="mr-2 h-4 w-4" />
                          Community Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {!isCreator && (
                    <DropdownMenuItem
                      onClick={handleLeaveCommunity}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Leave Community
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
