"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BookOpen, Plus, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { JournalEntry } from "@/lib/types"

interface JournalTabProps {
  entries: JournalEntry[]
  userId: string
}

export function JournalTab({ entries, userId }: JournalTabProps) {
  const [showNewEntry, setShowNewEntry] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleCreateEntry = async () => {
    if (!content.trim()) return

    setIsSubmitting(true)
    const supabase = createClient()

    const { error } = await supabase.from("journal_entries").insert({
      user_id: userId,
      title: title.trim() || null,
      content: content.trim(),
    })

    if (!error) {
      setTitle("")
      setContent("")
      setShowNewEntry(false)
      router.refresh()
    }

    setIsSubmitting(false)
  }

  const handleDeleteEntry = async (id: string) => {
    const supabase = createClient()
    await supabase.from("journal_entries").delete().eq("id", id)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Personal Journal</h2>
          <p className="text-sm text-muted-foreground">Your private thoughts and reflections</p>
        </div>
        <Dialog open={showNewEntry} onOpenChange={setShowNewEntry}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Journal Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewEntry(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEntry} disabled={isSubmitting || !content.trim()}>
                  {isSubmitting ? "Saving..." : "Save Entry"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {entries.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-medium">No journal entries yet</h3>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Start writing your thoughts and reflections
            </p>
            <Button onClick={() => setShowNewEntry(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Entry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  {entry.title && <h3 className="font-semibold">{entry.title}</h3>}
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.created_at).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDeleteEntry(entry.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{entry.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
