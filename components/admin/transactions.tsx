"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Calendar } from "lucide-react"
import { adminAPI } from "@/lib/api"
import type { AdminTransaction } from "@/lib/types"

export function AdminTransactions() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadTransactions = async () => {
    setIsLoading(true)
    try {
      const data = await adminAPI.getTransactions({
        page,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      setTransactions(data.transactions)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error("Failed to load transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, startDate, endDate])

  const handleDateFilter = () => {
    setPage(1)
    loadTransactions()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                placeholder="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex-1 relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                placeholder="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 sm:flex-initial">
              <Button onClick={handleDateFilter} className="flex-1 sm:flex-initial">Filter</Button>
              {(startDate || endDate) && (
                <Button variant="outline" onClick={() => {
                  setStartDate("")
                  setEndDate("")
                  setPage(1)
                }} className="flex-1 sm:flex-initial">
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No transactions found</div>
        ) : (
          <>
            <div className="border rounded-lg overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium">Date</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium hidden sm:table-cell">User</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium">Community</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium">Amount</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium hidden md:table-cell">Platform Fee</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-t">
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden sm:table-cell">{transaction.userName}</td>
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">{transaction.communityName}</td>
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium">${transaction.amount.toFixed(2)}</td>
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-muted-foreground hidden md:table-cell">${transaction.platformFee.toFixed(2)}</td>
                      <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium text-primary">
                        ${(transaction.amount - transaction.platformFee).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  onClick={() => setPage((p) => Math.max(1, p - 1))} 
                  disabled={page === 1}
                  className="flex-1 sm:flex-initial text-xs sm:text-sm"
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages}
                  className="flex-1 sm:flex-initial text-xs sm:text-sm"
                >
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

