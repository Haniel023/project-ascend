import Link from "next/link";
import { Settings } from "lucide-react";
import { verifySession } from "@/server/auth/dal";
import { logoutAction } from "@/server/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/rpg/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await verifySession();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-950 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-5">
          <Link href="/dashboard" className="text-sm font-bold tracking-[0.2em] text-amber-400 uppercase">
            Ascend
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-zinc-400 sm:flex">
            <Link href="/dashboard" className="hover:text-zinc-100">
              Dashboard
            </Link>
            <Link href="/profile" className="hover:text-zinc-100">
              Profile
            </Link>
            <Link href="/plans" className="hover:text-zinc-100">
              Plans
            </Link>
            <Link href="/log" className="hover:text-zinc-100">
              Log Workout
            </Link>
            <Link href="/log/history" className="hover:text-zinc-100">
              History
            </Link>
            <Link href="/quests" className="hover:text-zinc-100">
              Quests
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon">
            <Link href="/settings" aria-label="Settings">
              <Settings className="size-4" />
            </Link>
          </Button>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm">
              Log out
            </Button>
          </form>
        </div>
      </header>
      <main className="flex-1 pb-16 sm:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}
