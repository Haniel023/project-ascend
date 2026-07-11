// Single source of truth for the Project Ascend mark: an ascending chevron (leveling
// up / a mountain peak, both literal readings of "Ascend") with a summit dot for the
// goal being reached. Used everywhere the brand mark appears -- PWA icons, browser
// favicon, apple-touch-icon, and the splash/loading screens -- via next/og's
// ImageResponse, which renders this exact JSX tree through Satori.
export function AppIconMark({ size, radius = size * 0.22 }: { size: number; radius?: number }) {
  const chevronSize = size * 0.62;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 55%, #f59e0b 100%)",
        borderRadius: radius,
      }}
    >
      <svg width={chevronSize} height={chevronSize} viewBox="0 0 100 100" fill="none">
        <path
          d="M22 68 L50 34 L78 68"
          stroke="#fffbeb"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="50" cy="21" r="7.5" fill="#fffbeb" />
      </svg>
    </div>
  );
}
