"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, DollarSign, TrendingUp, UserPlus } from "lucide-react"
import type { AdminStats } from "@/lib/types"
import { Loader2 } from "lucide-react"

interface AdminStatsProps {
  stats: AdminStats | null
  isLoading: boolean
}

export function AdminStats({ stats, isLoading }: AdminStatsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Failed to load statistics</p>
        </CardContent>
      </Card>
    )
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      description: "Registered users",
    },
    {
      title: "Total Communities",
      value: stats.totalCommunities.toLocaleString(),
      icon: Building2,
      description: "Active communities",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: "All-time revenue",
    },
    {
      title: "Recent Signups",
      value: stats.recentSignups.toLocaleString(),
      icon: UserPlus,
      description: "Last 7 days",
    },
    {
      title: "Active Communities",
      value: stats.activeCommunities.toLocaleString(),
      icon: TrendingUp,
      description: "With posts in last 30 days",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

