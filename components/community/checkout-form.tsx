"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Clock, Check } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Community } from "@/lib/types"

interface CheckoutFormProps {
  community: Community
}

export function CheckoutForm({ community }: CheckoutFormProps) {
  return (
    <div className="container mx-auto max-w-2xl px-4">
      <Button variant="ghost" asChild className="mb-6">
        <Link href={`/community/${community.id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to community
        </Link>
      </Button>

      <Card>
        <CardHeader className="text-center">
          {community.image_url ? (
            <img
              src={community.image_url || "/placeholder.svg"}
              alt={community.name}
              className="mx-auto mb-4 h-20 w-20 rounded-xl object-cover"
            />
          ) : (
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-10 w-10 text-primary" />
            </div>
          )}
          <CardTitle className="text-2xl">Join {community.name}</CardTitle>
          <CardDescription>Get access to all community features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>Coming Soon!</strong> Paid community memberships are currently under development. 
              We&apos;re working hard to bring you a seamless payment experience. Check back soon!
            </AlertDescription>
          </Alert>

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Monthly Membership</p>
                <p className="text-sm text-muted-foreground">Billed monthly, cancel anytime</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">${(community.price_in_cents / 100).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">/month</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">What you&apos;ll get:</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                Access to all community posts and discussions
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                Create posts, comments, and interact with members
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                Join the member leaderboard
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                Real-time updates and notifications
              </li>
            </ul>
          </div>

          <Button className="w-full" size="lg" disabled>
            <Clock className="mr-2 h-4 w-4" />
            Coming Soon
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
