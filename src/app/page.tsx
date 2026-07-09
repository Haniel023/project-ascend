import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <span className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1 text-xs font-semibold tracking-[0.25em] text-amber-300 uppercase">
        Project Ascend
      </span>
      <h1 className="mt-6 max-w-3xl text-4xl leading-[1.1] font-bold text-white sm:text-6xl">
        Turn your workouts into an RPG you actually want to grind.
      </h1>
      <p className="mt-5 max-w-xl text-lg text-zinc-400">
        Build a training plan, log real sets, and earn XP for balanced training
        across every muscle group. Level up, rank up, and let your character
        sheet track a fitness journey that&apos;s actually happening.
      </p>
      <div className="mt-10 flex gap-3">
        <Button asChild size="lg" className="shadow-lg shadow-amber-500/20">
          <Link href="/signup">Create your hero</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/login">Log in</Link>
        </Button>
      </div>
    </main>
  );
}
