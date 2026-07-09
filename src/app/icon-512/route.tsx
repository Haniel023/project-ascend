import { ImageResponse } from "next/og";

export async function GET() {
  const size = 512;
  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 55%, #f59e0b 100%)",
          borderRadius: size * 0.22,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.56,
            fontWeight: 800,
            color: "#fff7ed",
            fontFamily: "Georgia, serif",
          }}
        >
          A
        </div>
      </div>
    ),
    { width: size, height: size }
  );
}
