import { BrandMark } from "@/components/BrandMark";

// Shared chrome for /login and /signup -- a single subtle spotlight + brand emblem
// above whatever the page renders. Kept confined to this route group (a `relative`
// glow within `main`, no negative z-index) so it never touches the rest of the app's
// deliberately flat background.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-svh flex-col items-center overflow-hidden px-4 pt-16 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[55vh] bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.16),transparent_70%)]"
      />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandMark size={80} />
          <p className="mt-4 text-xs font-semibold tracking-[0.3em] text-amber-400 uppercase">Project Ascend</p>
        </div>

        {children}
      </div>
    </main>
  );
}
