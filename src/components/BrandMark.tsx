// The Project Ascend mark as a regular React component (mirrors src/lib/appIcon.tsx,
// which renders the same shape through next/og's ImageResponse for PWA/favicon use).
// Used anywhere the brand mark appears live in the browser: the auth screens' emblem,
// the root loading screen, and the splash page.
export function BrandMark({ size = 64 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center bg-linear-to-br from-violet-900 via-violet-600 to-amber-500 shadow-[0_0_45px_-4px_rgba(245,158,11,0.6)]"
      style={{ width: size, height: size, borderRadius: size * 0.22 }}
    >
      <svg viewBox="0 0 100 100" width={size * 0.62} height={size * 0.62} fill="none">
        <path
          d="M22 68 L50 34 L78 68"
          stroke="#fffbeb"
          strokeWidth={11}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="50" cy="21" r={7.5} fill="#fffbeb" />
      </svg>
    </div>
  );
}
