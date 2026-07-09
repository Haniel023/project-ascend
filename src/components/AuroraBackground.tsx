// Flat, solid backdrop shared by every page. Kept as a component (rather than just a
// class on <body>) so the surface color has one place to change later if needed.
export function AuroraBackground() {
  return <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-[#0b0a10]" />;
}
