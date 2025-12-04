import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy } from "lucide-react"
import type { LeaderboardEntry } from "@/lib/types"

interface LeaderboardProps {
  entries: LeaderboardEntry[]
}

export function Leaderboard({ entries }: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">No activity yet. Start posting!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div key={entry.user_id} className="flex items-center gap-3">
              <div
                className={`
                flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold
                ${index === 0 ? "bg-yellow-500 text-yellow-950" : ""}
                ${index === 1 ? "bg-gray-300 text-gray-700" : ""}
                ${index === 2 ? "bg-amber-600 text-amber-950" : ""}
                ${index > 2 ? "bg-muted text-muted-foreground" : ""}
              `}
              >
                {index + 1}
              </div>
              <Avatar className="h-8 w-8">
                <AvatarImage src={entry.avatar_url || undefined} />
                <AvatarFallback className="text-xs">{entry.display_name?.[0]?.toUpperCase() || "?"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{entry.display_name || "Unknown"}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.post_count} posts, {entry.comment_count} comments
                </p>
              </div>
              <div className="text-sm font-semibold text-primary">{entry.total_activity}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
