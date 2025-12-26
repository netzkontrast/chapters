"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Logo } from "@/components/Logo"
import { MuseLogo } from "@/components/muse/MuseLogo"
import { useSaveOnboardingPreferences } from "@/hooks/useMuse"

interface MuseOnboardingProps {
  onComplete: (preferences: OnboardingPreferences) => void
  onSkip: () => void
}

export interface OnboardingPreferences {
  museMode: "gentle" | "on-demand" | "quiet"
  expressionTypes: string[]
  tone: string[]
  completedAt: string
}

export function MuseOnboarding({ onComplete, onSkip }: MuseOnboardingProps) {
  const [step, setStep] = useState(1)
  const [museMode, setMuseMode] = useState<"gentle" | "on-demand" | "quiet">("gentle")
  const [expressionTypes, setExpressionTypes] = useState<string[]>([])
  const [tone, setTone] = useState<string[]>([])

  const savePreferences = useSaveOnboardingPreferences()

  const handleComplete = async () => {
    const preferences: OnboardingPreferences = {
      museMode,
      expressionTypes,
      tone,
      completedAt: new Date().toISOString(),
    }

    try {
      await savePreferences.mutateAsync(preferences)
      localStorage.setItem('muse-onboarding', JSON.stringify(preferences))
      onComplete(preferences)
    } catch (error) {
      console.error("Failed to save preferences:", error)
      localStorage.setItem('muse-onboarding', JSON.stringify(preferences))
      onComplete(preferences)
    }
  }

  const toggleExpression = (type: string) => {
    setExpressionTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const toggleTone = (t: string) => {
    setTone(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    )
  }

  const goBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const goNext = () => {
    // Validate current step before proceeding
    if (step === 2 && !museMode) return // Must select a Muse mode
    if (step === 3 && expressionTypes.length === 0) return // Must select at least one expression type
    if (step === 4 && tone.length === 0) return // Must select at least one tone
    
    if (step < 5) setStep(step + 1)
  }

  // Check if current step is valid
  const canProceed = () => {
    if (step === 2) return !!museMode
    if (step === 3) return expressionTypes.length > 0
    if (step === 4) return tone.length > 0
    return true
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {/* Step 1: Welcome */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-center mb-8 animate-fade-in">
                  <div className="flex justify-center mb-6">
                    <Logo size={80} animate={true} />
                  </div>
                  <h1 className="text-4xl font-serif font-bold text-foreground mb-3">
                    Welcome to Chapters
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    A place to write, read, and take your time
                  </p>
                </div>

                <div className="bg-card rounded-lg border border-border p-8 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in-delay-1">
                  <div className="text-center space-y-4 text-muted-foreground">
                    <p className="text-lg">Everyone's a book.</p>
                    <p className="text-lg">Each post is a chapter.</p>
                    <div className="pt-4 pb-4 border-t border-border/50 mt-6">
                      <p className="text-lg">This isn't a feed.</p>
                      <p className="text-lg">It's a place for depth, not dopamine.</p>
                    </div>
                    <div className="pt-4">
                      <p className="text-lg font-medium text-foreground">I'm Muse.</p>
                      <p className="text-base">I can sit beside you while you explore — or stay quiet if you prefer.</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                    <Button size="lg" onClick={() => setStep(2)} className="transition-calm hover:scale-105">
                      Meet Muse
                    </Button>
                    <Button size="lg" variant="outline" onClick={onSkip} className="transition-calm">
                      Skip for now
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Who is Muse */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-center mb-8 animate-fade-in">
                  <div className="flex justify-center mb-4">
                    <MuseLogo size={64} animate={true} />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
                    A gentle companion
                  </h2>
                  <p className="text-muted-foreground max-w-xl mx-auto">
                    I don't write for you. I don't rush you. I don't care about trends.
                  </p>
                </div>

                <div className="bg-card rounded-lg border border-border p-8 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in-delay-1">
                  <p className="text-center text-sm text-muted-foreground mb-6">
                    How would you like me to show up?
                  </p>
                  
                  <div className="space-y-4">
                    {[
                      { mode: "gentle", title: "Gentle nudges now and then", desc: "I'll offer suggestions when it feels right" },
                      { mode: "on-demand", title: "Only when I ask", desc: "I'll wait for you to reach out" },
                      { mode: "quiet", title: "Stay quiet for now", desc: "I'll be here if you change your mind" },
                    ].map(({ mode, title, desc }) => (
                      <button
                        key={mode}
                        onClick={() => setMuseMode(mode as any)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all bg-card ${
                          museMode === mode
                            ? "border-primary shadow-sm"
                            : "border-border hover:border-primary/50 hover:shadow-sm"
                        }`}
                      >
                        <div className="font-medium text-foreground mb-1">{title}</div>
                        <div className="text-sm text-muted-foreground">{desc}</div>
                      </button>
                    ))}

                    <p className="text-xs text-center text-muted-foreground pt-2">
                      You can change this anytime in preferences.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <Button variant="ghost" onClick={goBack}>← Back</Button>
                  <Button 
                    size="lg" 
                    onClick={goNext} 
                    disabled={!museMode}
                    className="transition-calm hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Expression Style */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-center mb-8 animate-fade-in">
                  <div className="flex justify-center mb-4">
                    <MuseLogo size={64} animate={true} />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
                    How do you usually express yourself?
                  </h2>
                  <p className="text-muted-foreground max-w-xl mx-auto">
                    There's no right answer. This just helps me understand your rhythm.
                  </p>
                </div>

                <div className="bg-card rounded-lg border border-border p-8 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in-delay-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: "writing", label: "Writing & journaling", emoji: "📝" },
                      { id: "visual", label: "Visual art & photography", emoji: "🎨" },
                      { id: "audio", label: "Voice, sound, or music", emoji: "🎧" },
                      { id: "video", label: "Short films & video", emoji: "🎬" },
                      { id: "thoughts", label: "Thoughts & observations", emoji: "💡" },
                      { id: "figuring", label: "I'm still figuring it out", emoji: "💭" },
                    ].map(({ id, label, emoji }) => (
                      <button
                        key={id}
                        onClick={() => toggleExpression(id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left bg-card ${
                          expressionTypes.includes(id)
                            ? "border-primary shadow-sm"
                            : "border-border hover:border-primary/50 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{emoji}</span>
                          <span className="font-medium text-foreground">{label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <p className="text-xs text-center text-muted-foreground mt-4">
                    You can select multiple — most people do.
                  </p>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <Button variant="ghost" onClick={goBack}>← Back</Button>
                  <Button 
                    size="lg" 
                    onClick={goNext} 
                    disabled={expressionTypes.length === 0}
                    className="transition-calm hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Tone */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-center mb-8 animate-fade-in">
                  <div className="flex justify-center mb-4">
                    <MuseLogo size={64} animate={true} />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
                    What's the usual tone?
                  </h2>
                  <p className="text-muted-foreground max-w-xl mx-auto">
                    Choose what feels closest — you can always change.
                  </p>
                </div>

                <div className="bg-card rounded-lg border border-border p-8 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in-delay-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      "Calm & reflective",
                      "Raw & honest",
                      "Dreamy & surreal",
                      "Playful & experimental",
                      "Curious & questioning",
                      "It really depends",
                    ].map((t) => (
                      <button
                        key={t}
                        onClick={() => toggleTone(t)}
                        className={`p-4 rounded-lg border-2 transition-all bg-card ${
                          tone.includes(t)
                            ? "border-primary shadow-sm"
                            : "border-border hover:border-primary/50 hover:shadow-sm"
                        }`}
                      >
                        <span className="font-medium text-foreground">{t}</span>
                      </button>
                    ))}
                  </div>
                  
                  <p className="text-xs text-center text-muted-foreground mt-4">
                    You can select multiple — most people do.
                  </p>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <Button variant="ghost" onClick={goBack}>← Back</Button>
                  <Button 
                    size="lg" 
                    onClick={goNext} 
                    disabled={tone.length === 0}
                    className="transition-calm hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Language Tour */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-center mb-8 animate-fade-in">
                  <div className="flex justify-center mb-4">
                    <MuseLogo size={64} animate={true} />
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-foreground mb-3">
                    Before we begin…
                  </h2>
                  <p className="text-muted-foreground">
                    A few things you'll hear around here
                  </p>
                </div>

                <div className="bg-card rounded-lg border border-border p-8 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in-delay-1">
                  <div className="space-y-4 max-w-xl mx-auto text-muted-foreground">
                    {[
                      { label: "Your profile is your", term: "Book" },
                      { label: "Your posts are", term: "Chapters" },
                      { label: "Home is your", term: "Library", extra: " — a bookshelf, not a feed" },
                      { label: "You write privately in your", term: "Study" },
                      { label: "You get", term: "Open Pages", extra: " instead of unlimited posting" },
                    ].map(({ label, term, extra }, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-primary mt-1">•</span>
                        <p>
                          {label} <span className="text-foreground font-medium">{term}</span>{extra}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="text-center mt-8">
                    <p className="text-sm text-muted-foreground mb-6">
                      You'll learn the rest by using the app. No memorizing required.
                    </p>
                    <Button 
                      size="lg" 
                      onClick={handleComplete}
                      disabled={savePreferences.isPending}
                      className="transition-calm hover:scale-105 hover:shadow-lg"
                    >
                      {savePreferences.isPending ? "Saving..." : "Open the Library"}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-start mt-6">
                  <Button variant="ghost" onClick={goBack}>← Back</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Indicator */}
          {step > 1 && step < 6 && (
            <div className="flex justify-center gap-2 mt-8">
              {[2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 w-12 rounded-full transition-all ${
                    s <= step ? "bg-primary" : "bg-border"
                  }`}
                  aria-label={`Step ${s}`}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
