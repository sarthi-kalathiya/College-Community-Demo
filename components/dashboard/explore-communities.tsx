"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Users, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import type { Community } from "@/lib/types"

export function ExploreCommunities() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")

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

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
      }

      const { data } = await query.order("created_at", { ascending: false }).limit(20)

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
  }, [search])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Explore Communities</h2>
        <p className="text-sm text-muted-foreground">Discover and join communities that interest you</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search communities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : communities.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-medium">No communities found</h3>
            <p className="text-sm text-muted-foreground">
              {search ? "Try a different search term" : "Be the first to create a community!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {communities.map((community) => (
            <Card key={community.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                {community.image_url ? (
                  <img
                    src={community.image_url}
                    alt={community.name}
                    className="mb-4 h-32 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="mb-4 flex h-32 w-full items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-12 w-12 text-primary" />
                  </div>
                )}
                <CardTitle className="line-clamp-1">{community.name}</CardTitle>
                {community.description && (
                  <CardDescription className="line-clamp-2">{community.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{community.member_count || 0} members</span>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/community/${community.id}`}>
                      View
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="text-center">
        <Button variant="outline" asChild>
          <Link href="/community">
            View All Communities
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

