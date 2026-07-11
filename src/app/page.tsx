import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/BrandMark";

export default function Home() {
  return (
    <main className="relative flex min-h-svh flex-col items-center overflow-hidden px-6 pt-16 pb-[max(2.5rem,env(safe-area-inset-bottom))] text-center sm:pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[55vh] bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.16),transparent_70%)]"
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        <BrandMark size={80} />
        <p className="mt-4 text-xs font-semibold tracking-[0.3em] text-amber-400 uppercase">Project Ascend</p>

        <h1 className="mt-6 text-3xl leading-[1.15] font-bold text-white sm:text-4xl">
          Turn your workouts into an RPG you actually want to grind.
        </h1>
        <p className="mt-3 text-sm text-zinc-400">
          Log real sets, earn XP for balanced training, and let your character sheet track a fitness
          journey that&apos;s actually happening.
        </p>

        <div className="mt-10 flex w-full flex-col gap-3">
          <Button
            asChild
            size="lg"
            className="h-12 w-full rounded-full text-base font-semibold shadow-lg shadow-amber-500/20"
          >
            <Link href="/signup">Create your hero</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 w-full rounded-full text-base font-semibold">
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
