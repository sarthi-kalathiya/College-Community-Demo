"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2, MoreVertical } from "lucide-react"
import { adminAPI } from "@/lib/api"
import type { AdminCommunity } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AdminCommunities() {
  const [communities, setCommunities] = useState<AdminCommunity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const loadCommunities = async () => {
    setIsLoading(true)
    try {
      const data = await adminAPI.getCommunities({
        page,
        search: search || undefined,
        status: statusFilter || undefined,
      })
      setCommunities(data.communities)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error("Failed to load communities:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCommunities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, statusFilter])

  const handleStatusUpdate = async (id: string, status: "active" | "suspended" | "deleted") => {
    setUpdatingStatus(id)
    try {
      await adminAPI.updateCommunityStatus(id, status)
      loadCommunities()
    } catch (error) {
      console.error("Failed to update status:", error)
      alert("Failed to update community status")
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "suspended":
        return "secondary"
      case "deleted":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communities Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search communities..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No communities found</div>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Creator</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Members</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Revenue</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {communities.map((community) => (
                    <tr key={community.id} className="border-t">
                      <td className="px-4 py-3 font-medium">{community.name}</td>
                      <td className="px-4 py-3">{community.creator || "Unknown"}</td>
                      <td className="px-4 py-3">{community.memberCount}</td>
                      <td className="px-4 py-3">${community.revenue.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={getStatusBadgeVariant(community.status)}>
                          {community.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={updatingStatus === community.id}>
                              {updatingStatus === community.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreVertical className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {community.status !== "active" && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(community.id, "active")}>
                                Activate
                              </DropdownMenuItem>
                            )}
                            {community.status !== "suspended" && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(community.id, "suspended")}>
                                Suspend
                              </DropdownMenuItem>
                            )}
                            {community.status !== "deleted" && (
                              <DropdownMenuItem
                                onClick={() => handleStatusUpdate(community.id, "deleted")}
                                className="text-destructive"
                              >
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  Previous
                </Button>
                <Button variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

