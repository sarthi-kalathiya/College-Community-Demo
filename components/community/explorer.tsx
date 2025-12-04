"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Users, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import type { Community } from "@/lib/types"

export function CommunitiesExplorer() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "free" | "paid">("all")

  useEffect(() => {
    const loadCommunities = async () => {
      setIsLoading(true)
      const supabase = createClient()

      let query = supabase
        .from("communities")
        .select(`
          *,
          creator:profiles!communities_creator_id_fkey(id, display_name, avatar_url)
        `)
        .eq("is_public", true)
        .eq("status", "active")

      // Apply search filter
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
      }

      // Apply price filter
      if (filter === "free") {
        query = query.eq("price_in_cents", 0)
      } else if (filter === "paid") {
        query = query.gt("price_in_cents", 0)
      }

      const { data } = await query.order("created_at", { ascending: false }).limit(50)

      if (data) {
        // Get member counts for each community
        const communitiesWithCounts = await Promise.all(
          data.map(async (c) => {
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

        setCommunities(communitiesWithCounts as Community[])
      }
      setIsLoading(false)
    }

    loadCommunities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filter])

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search communities by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filter === "free" ? "default" : "outline"}
            onClick={() => setFilter("free")}
            size="sm"
          >
            Free
          </Button>
          <Button
            variant={filter === "paid" ? "default" : "outline"}
            onClick={() => setFilter("paid")}
            size="sm"
          >
            Paid
          </Button>
        </div>
      </div>

      {/* Results Count */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground">
          {communities.length} {communities.length === 1 ? "community" : "communities"} found
        </p>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : communities.length === 0 ? (
        /* Empty State */
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-medium">No communities found</h3>
            <p className="text-center text-sm text-muted-foreground">
              {search || filter !== "all"
                ? "Try adjusting your search or filters"
                : "Be the first to create a community!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Communities Grid */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {communities.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      )}
    </div>
  )
}

function CommunityCard({ community }: { community: Community }) {
  const isFree = community.price_in_cents === 0

  return (
    <Card className="group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <div className="aspect-video relative overflow-hidden bg-muted">
        {community.image_url ? (
          <img
            src={community.image_url}
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
        <CardTitle className="line-clamp-1">{community.name}</CardTitle>
        {community.description && (
          <CardDescription className="line-clamp-2">{community.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1 pb-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={community.creator?.avatar_url || undefined} />
            <AvatarFallback className="text-xs">
              {community.creator?.display_name?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">by {community.creator?.display_name || "Unknown"}</span>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{community.member_count || 0} members</span>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link href={`/community/${community.id}`}>
            View
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

