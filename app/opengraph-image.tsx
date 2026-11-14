import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Note: Hex color values are intentional here because ImageResponse executes
// in a specialized edge/canvas runtime that does not support CSS variables or Tailwind classes.
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          backgroundColor: "#0B0B0F",
          border: "12px solid #14141C",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top: Brand mark */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "#14141C",
              border: "1px solid #262633",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: 700,
              color: "#7C3AED",
            }}
          >
            A
          </div>
          <span
            style={{
              fontSize: "20px",
              fontWeight: 500,
              color: "#A78BFA",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Portfolio
          </span>
        </div>

        {/* Center: Name & Primary Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h1
            style={{
              fontSize: "68px",
              fontWeight: 700,
              color: "#F5F5F7",
              letterSpacing: "-0.03em",
              margin: 0,
              lineHeight: 1.05,
            }}
          >
            Ansh Vaishnav
          </h1>
          <p
            style={{
              fontSize: "32px",
              fontWeight: 500,
              color: "#A78BFA",
              margin: 0,
            }}
          >
            Video editor
          </p>
        </div>

        {/* Bottom: Core focus tags (strictly from resume facts) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            borderTop: "1px solid #262633",
            paddingTop: "32px",
            fontSize: "20px",
            color: "#9CA3AF",
          }}
        >
          <span>Pacing & Sound design</span>
          <span style={{ color: "#7C3AED" }}>•</span>
          <span>YouTube long-form & Reels</span>
          <span style={{ color: "#7C3AED" }}>•</span>
          <span>Adobe Premiere Pro</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

