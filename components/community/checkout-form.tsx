"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Shield, Check } from "lucide-react"
import Link from "next/link"
import { createCommunityCheckoutSession } from "@/app/actions/stripe"
import type { Community } from "@/lib/types"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutFormProps {
  community: Community
}

export function CheckoutForm({ community }: CheckoutFormProps) {
  const [showCheckout, setShowCheckout] = useState(false)
  const router = useRouter()

  const fetchClientSecret = useCallback(() => {
    return createCommunityCheckoutSession(community.id)
  }, [community.id])

  const handleComplete = useCallback(async () => {
    // Wait a moment for Stripe to process
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push(`/community/${community.id}`)
    router.refresh()
  }, [community.id, router])

  return (
    <div className="container mx-auto max-w-2xl px-4">
      <Button variant="ghost" asChild className="mb-6">
        <Link href={`/community/${community.id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to community
        </Link>
      </Button>

      {!showCheckout ? (
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
              <p className="text-sm font-medium">What you get:</p>
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

            <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              Secure payment powered by Stripe
            </div>

            <Button className="w-full" size="lg" onClick={() => setShowCheckout(true)}>
              Continue to Payment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Complete Payment</CardTitle>
            <CardDescription>
              Subscribing to {community.name} for ${(community.price_in_cents / 100).toFixed(2)}/month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{
                fetchClientSecret,
                onComplete: handleComplete,
              }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
