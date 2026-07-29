import { ImageResponse } from "next/og";
import { OG_IMAGE_ALT, OG_IMAGE_SIZE } from "@/lib/seo";

// Lives under [lang]/ on purpose. At the app root this route would be
// /opengraph-image — extension-less, so src/proxy.ts would 307 it to
// /en/opengraph-image, and several social crawlers don't follow that redirect.
// The image would look fine in a browser and break in every preview card.

export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";
export const alt = OG_IMAGE_ALT;

// Deliberately not localized: Satori's default font has no Arabic coverage, so
// localized text would render as tofu on /ar. One English card for all locales.
const LANGUAGES = ["Python", "JavaScript", "TypeScript", "Go", "Rust", "Java", "SQL"];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b0d12",
          padding: "72px 80px",
        }}
      >
        {/* Brand mark: the same node-and-edge glyph as the favicon. */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <svg width="72" height="72" viewBox="0 0 100 100">
            <rect width="100" height="100" rx="22" fill="#4f46e5" />
            <path
              d="M20 30 L40 70 L50 50 L60 70 L80 30"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="20" cy="30" r="5" fill="white" />
            <circle cx="80" cy="30" r="5" fill="white" />
            <circle cx="50" cy="50" r="6" fill="white" />
            <circle cx="40" cy="70" r="5" fill="white" />
            <circle cx="60" cy="70" r="5" fill="white" />
          </svg>
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              color: "#e6e9ef",
              letterSpacing: "-0.02em",
            }}
          >
            Weftmap
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              maxWidth: 900,
            }}
          >
            Paste code, get a call graph.
          </div>
          <div style={{ fontSize: 32, color: "#94a3b8", maxWidth: 860 }}>
            Interactive diagrams of what calls what — free and open source.
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {LANGUAGES.map((name) => (
            <div
              key={name}
              style={{
                display: "flex",
                fontSize: 22,
                color: "#9aa6b8",
                border: "1px solid #232a36",
                borderRadius: 999,
                padding: "8px 20px",
              }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
