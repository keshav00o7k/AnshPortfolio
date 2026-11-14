import { ImageResponse } from "next/og";

// Size configuration for the favicon / app icon
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Note: Hex color values are intentional here because ImageResponse executes
// in a specialized edge/canvas runtime that does not support CSS variables or Tailwind classes.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0B0B0F",
          borderRadius: "8px",
          border: "1px solid #262633",
        }}
      >
        <span
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#7C3AED",
            fontFamily: "system-ui, -apple-system, sans-serif",
            lineHeight: 1,
          }}
        >
          A
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}

