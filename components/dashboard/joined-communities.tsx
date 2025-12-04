import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Compass } from "lucide-react"
import type { Membership } from "@/lib/types"

interface JoinedCommunitiesProps {
  memberships: Membership[]
}

export function JoinedCommunities({ memberships }: JoinedCommunitiesProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Joined Communities</h2>
          <p className="text-sm text-muted-foreground">Communities you&apos;re a member of</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/#communities">
            <Compass className="mr-2 h-4 w-4" />
            Explore
          </Link>
        </Button>
      </div>

      {memberships.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Compass className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-medium">No communities joined yet</h3>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Discover and join communities that interest you
            </p>
            <Button asChild>
              <Link href="/#communities">Explore Communities</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {memberships.map((membership) => {
            const community = membership.community
            if (!community) return null

            return (
              <Card
                key={membership.id}
                className="group flex flex-col overflow-hidden transition-shadow hover:shadow-md"
              >
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
                </div>

                <CardHeader className="pb-2">
                  <h3 className="font-semibold leading-tight line-clamp-1">{community.name}</h3>
                </CardHeader>

                <CardContent className="flex-1 pb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={community.creator?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {community.creator?.display_name?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      by {community.creator?.display_name || "Unknown"}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between border-t pt-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{community.member_count || 0}</span>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/community/${community.id}`}>Open</Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
