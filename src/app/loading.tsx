import { BrandMark } from "@/components/BrandMark";

// Root-level Suspense fallback -- shown the moment the app starts loading, before any
// route-specific data is ready. Kept intentionally minimal (no layout shift risk, no
// heavy animation) since it's the very first thing a visitor or a cold PWA launch sees.
export default function RootLoading() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <div className="animate-pulse">
        <BrandMark size={72} />
      </div>
      <p className="text-xs font-semibold tracking-[0.3em] text-amber-400 uppercase">Project Ascend</p>
    </div>
  );
}
