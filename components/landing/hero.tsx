import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Users, Zap } from "lucide-react"

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b bg-muted/30">
      <div className="container mx-auto px-4 py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Build and grow your community</span>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance md:text-5xl lg:text-6xl">
            Where communities
            <span className="text-primary"> come together</span>
          </h1>

          <p className="mb-8 text-lg text-muted-foreground text-pretty md:text-xl">
            Create, join, and engage with communities that matter to you. Share ideas, connect with like-minded people,
            and build something meaningful.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">
                Start your community
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#communities">Explore communities</Link>
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-8 border-t pt-8">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold">1000+</p>
              <p className="text-sm text-muted-foreground">Active members</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold">50+</p>
              <p className="text-sm text-muted-foreground">Communities</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold">Real-time</p>
              <p className="text-sm text-muted-foreground">Updates</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
