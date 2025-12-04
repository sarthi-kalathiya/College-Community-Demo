import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import type { Community } from "@/lib/types"

interface CommunitiesGridProps {
  communities: Community[]
}

export function CommunitiesGrid({ communities }: CommunitiesGridProps) {
  return (
    <section id="communities" className="container mx-auto px-4 py-16">
      <div className="mb-10 text-center">
        <h2 className="mb-3 text-3xl font-bold">Discover Communities</h2>
        <p className="text-muted-foreground">Find your people and join the conversation</p>
      </div>

      {communities.length === 0 ? (
        <div className="mx-auto max-w-md rounded-lg border border-dashed p-12 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="mb-2 text-lg font-medium">No communities yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Be the first to create a community and start building your tribe.
          </p>
          <Button asChild>
            <Link href="/auth/sign-up">Create the first community</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {communities.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      )}
    </section>
  )
}

function CommunityCard({ community }: { community: Community }) {
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
          <Link href={`/community/${community.id}`}>View</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
