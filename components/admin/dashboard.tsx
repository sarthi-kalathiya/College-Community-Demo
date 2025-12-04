"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminStats } from "@/components/admin/stats"
import { AdminUsers } from "@/components/admin/users"
import { AdminCommunities } from "@/components/admin/communities"
import { AdminTransactions } from "@/components/admin/transactions"
import { adminAPI } from "@/lib/api"
import type { AdminStats as AdminStatsType } from "@/lib/types"

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStatsType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await adminAPI.getStats()
        setStats(data)
      } catch (error) {
        console.error("Failed to load stats:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadStats()
  }, [])

  return (
    <Tabs defaultValue="stats" className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 overflow-x-auto">
        <TabsTrigger value="stats" className="text-xs sm:text-sm">Overview</TabsTrigger>
        <TabsTrigger value="users" className="text-xs sm:text-sm">Users</TabsTrigger>
        <TabsTrigger value="communities" className="text-xs sm:text-sm">Communities</TabsTrigger>
        <TabsTrigger value="transactions" className="text-xs sm:text-sm">Transactions</TabsTrigger>
      </TabsList>

      <TabsContent value="stats" className="mt-6">
        <AdminStats stats={stats} isLoading={isLoading} />
      </TabsContent>

      <TabsContent value="users" className="mt-6">
        <AdminUsers />
      </TabsContent>

      <TabsContent value="communities" className="mt-6">
        <AdminCommunities />
      </TabsContent>

      <TabsContent value="transactions" className="mt-6">
        <AdminTransactions />
      </TabsContent>
    </Tabs>
  )
}

