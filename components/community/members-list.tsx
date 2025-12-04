import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Crown } from "lucide-react"
import type { Profile } from "@/lib/types"

interface MembersListProps {
  members: Profile[]
  creatorId: string
}

export function MembersList({ members, creatorId }: MembersListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map((member) => {
            const isCreator = member.id === creatorId
            return (
              <div key={member.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50">
                <Avatar>
                  <AvatarImage src={member.avatar_url || undefined} />
                  <AvatarFallback>{member.display_name?.[0]?.toUpperCase() || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{member.display_name || "Unknown"}</p>
                  {member.bio && <p className="text-xs text-muted-foreground truncate">{member.bio}</p>}
                </div>
                {isCreator && (
                  <Badge variant="secondary" className="text-xs">
                    <Crown className="mr-1 h-3 w-3" />
                    Creator
                  </Badge>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
