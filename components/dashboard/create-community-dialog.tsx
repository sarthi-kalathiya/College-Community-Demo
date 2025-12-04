"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"

interface CreateCommunityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCommunityDialog({ open, onOpenChange }: CreateCommunityDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isPaid, setIsPaid] = useState(false)
  const [price, setPrice] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    setError(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError("You must be logged in to create a community")
      setIsSubmitting(false)
      return
    }

    const priceInCents = isPaid ? Math.round(Number.parseFloat(price) * 100) : 0

    const { data, error: createError } = await supabase
      .from("communities")
      .insert({
        name: name.trim(),
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
        creator_id: user.id,
        is_public: true,
        price_in_cents: priceInCents,
      })
      .select()
      .single()

    if (createError) {
      setError(createError.message)
      setIsSubmitting(false)
      return
    }

    // Reset form
    setName("")
    setDescription("")
    setImageUrl("")
    setIsPaid(false)
    setPrice("")
    onOpenChange(false)

    // Navigate to new community
    router.push(`/community/${data.id}`)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Community</DialogTitle>
          <DialogDescription>Build a space for people to connect and share</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Community Name *</Label>
            <Input
              id="name"
              placeholder="My Awesome Community"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What's your community about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Cover Image URL</Label>
            <Input
              id="imageUrl"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="paid">Paid Community</Label>
              <p className="text-xs text-muted-foreground">Charge members to join</p>
            </div>
            <Switch id="paid" checked={isPaid} onCheckedChange={setIsPaid} />
          </div>

          {isPaid && (
            <div className="space-y-2">
              <Label htmlFor="price">Monthly Price (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="price"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="9.99"
                  className="pl-7"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required={isPaid}
                />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? "Creating..." : "Create Community"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
