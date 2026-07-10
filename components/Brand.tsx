import { COLORS, FONTS, SHADOW } from "@/lib/tokens";

export interface BrandProps {
  markSize?: number;
  markFontSize?: number;
  wordmarkFontSize?: number;
  shadow?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: number;
}

export default function Brand({
  markSize = 36,
  markFontSize = 18,
  wordmarkFontSize = 20,
  shadow = 3,
  gap = 10,
}: BrandProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap }}>
      <div
        style={{
          width: markSize,
          height: markSize,
          background: COLORS.surface,
          border: `3px solid ${COLORS.ink}`,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONTS.display,
          fontWeight: 700,
          fontSize: markFontSize,
          boxShadow: SHADOW(shadow),
        }}
      >
        S
      </div>
      <span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: wordmarkFontSize }}>Storyseed</span>
    </div>
  );
}
