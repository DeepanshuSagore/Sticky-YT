import { LandingAuthActions } from "@/components/landing-auth-actions";
import { ThreeBackground } from "@/components/three-background";

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <ThreeBackground />
      <div className="noise-bg relative mx-auto flex w-full max-w-5xl flex-col items-center gap-16 rounded-3xl border border-white/10 px-8 py-16 text-center md:px-14">
        <div className="glass-card absolute inset-0 -z-10 rounded-3xl" />
        <div className="space-y-6">
          <p className="inline-flex rounded-full border border-red-500/40 bg-red-500/12 px-4 py-1 text-xs tracking-[0.32em] text-red-300 uppercase">
            StickyYT
          </p>
          <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">
            Track what you watch.
            <span className="block text-red-400">Stay intentional.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-zinc-300 sm:text-base">
            StickyYT keeps your current and next-to-watch YouTube videos in one clean space.
            Stay focused, keep your queue intentional, and jump back exactly where you left off.
          </p>
        </div>
        <LandingAuthActions />
      </div>
    </main>
  );
}
