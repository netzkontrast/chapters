"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AnimatedSection } from "@/components/AnimatedSection"
import { PageTransition } from "@/components/PageTransition"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { MuseLogo } from "@/components/muse/MuseLogo"

export default function MusePage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        
        <div className="container mx-auto px-4 py-16 max-w-4xl flex-1">
          {/* Hero Section */}
          <AnimatedSection className="text-center mb-16 pt-8">
            <div className="mb-8 flex justify-center">
              <MuseLogo size={96} animate={true} />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
              Meet Muse
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Your quiet creative companion
            </p>
          </AnimatedSection>

          {/* What is Muse */}
          <AnimatedSection delay={200} className="mb-12">
            <div className="bg-card border border-border rounded-lg p-8">
              <h2 className="text-2xl font-serif font-semibold text-foreground mb-4">
                What is Muse?
              </h2>
              <p className="text-foreground leading-relaxed mb-4">
                Muse is an AI writing companion designed to support your creative process without taking over. 
                Think of it as a gentle presence that offers suggestions when you need them, then steps back 
                when you don't.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Muse never publishes for you. It never auto-completes your thoughts. It simply offers prompts, 
                suggestions, and gentle nudges to help you find your own voice.
              </p>
            </div>
          </AnimatedSection>

          {/* What Muse Can Do */}
          <AnimatedSection delay={300} className="mb-12">
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-6">
              What Muse Can Do
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-3xl mb-3">✍️</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Writing Prompts
                </h3>
                <p className="text-muted-foreground text-sm">
                  Get gentle nudges to start writing. Muse offers prompts based on your mood, 
                  themes, and past work.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-3xl mb-3">📝</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Title Suggestions
                </h3>
                <p className="text-muted-foreground text-sm">
                  Stuck on a title? Muse can suggest options that capture the essence of your chapter.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-3xl mb-3">🎨</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Text Refinement
                </h3>
                <p className="text-muted-foreground text-sm">
                  Need to tighten a paragraph? Muse can help refine your writing while preserving your voice.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-3xl mb-3">🔮</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Quiet Picks
                </h3>
                <p className="text-muted-foreground text-sm">
                  Discover chapters that match your taste, not what's trending. Muse learns what resonates with you.
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* How Muse Grows */}
          <AnimatedSection delay={400} className="mb-12">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-8">
              <h2 className="text-2xl font-serif font-semibold text-foreground mb-4">
                Muse Grows With You
              </h2>
              <p className="text-foreground leading-relaxed mb-6">
                As you write, read, and engage with Chapters, Muse evolves through four levels:
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">✨</span>
                  <div>
                    <h3 className="font-semibold text-foreground">Spark</h3>
                    <p className="text-sm text-muted-foreground">
                      Prompts, titles, and basic suggestions
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-2xl">🔨</span>
                  <div>
                    <h3 className="font-semibold text-foreground">Shaper</h3>
                    <p className="text-sm text-muted-foreground">
                      Structure and theme insights
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-2xl">🔮</span>
                  <div>
                    <h3 className="font-semibold text-foreground">Echo</h3>
                    <p className="text-sm text-muted-foreground">
                      Voice memory and remixing
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-2xl">🌟</span>
                  <div>
                    <h3 className="font-semibold text-foreground">Resonance</h3>
                    <p className="text-sm text-muted-foreground">
                      Connection facilitation and deep insights
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mt-6 italic">
                Your progress is private. Muse levels are about capability, not competition.
              </p>
            </div>
          </AnimatedSection>

          {/* What Muse Won't Do */}
          <AnimatedSection delay={500} className="mb-12">
            <div className="bg-card border border-border rounded-lg p-8">
              <h2 className="text-2xl font-serif font-semibold text-foreground mb-4">
                What Muse Won't Do
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-1">•</span>
                  <span className="text-foreground">
                    <strong>Auto-publish</strong> — You're always in control of what gets shared
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-1">•</span>
                  <span className="text-foreground">
                    <strong>Write for you</strong> — Muse suggests, you decide
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-1">•</span>
                  <span className="text-foreground">
                    <strong>Push notifications</strong> — Muse waits until you ask
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-1">•</span>
                  <span className="text-foreground">
                    <strong>Track metrics</strong> — No word counts, no streaks, no pressure
                  </span>
                </li>
              </ul>
            </div>
          </AnimatedSection>

          {/* CTA */}
          <AnimatedSection delay={600} className="text-center">
            <p className="text-muted-foreground mb-6">
              Ready to start writing with Muse by your side?
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg">
                  Start Your Book
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline">
                  Learn More About Chapters
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>

        <Footer />
      </div>
    </PageTransition>
  )
}
