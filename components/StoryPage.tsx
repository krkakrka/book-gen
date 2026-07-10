"use client";

import type { StyleId } from "@/lib/types";
import { COLORS, FONTS, SHADOW } from "@/lib/tokens";

export interface StoryPageProps {
  kind: "cover" | "page";
  title?: string;
  value?: string;
  accent?: string;
  imageDesc?: string;
  text?: string;
  variant?: StyleId;
  pageNum?: number;
  pageTotal?: number;
}

const PALETTES = {
  crayon: { base: "#FFE7A0", a: "#FF8A3D", b: COLORS.blue, band: "#FFFDF5" },
  cutout: { base: COLORS.green, a: COLORS.yellow, b: COLORS.pink, band: COLORS.surface },
  watercolor: { base: "#CBD8FF", a: "#F7B0CC", b: "#B8E6D2", band: "#FBFAFF" },
} as const;

function getIllustrationBg(
  kind: "cover" | "page",
  variant: StyleId,
  accent: string
): string {
  const pal = PALETTES[variant] ?? PALETTES.crayon;
  if (kind === "cover") return accent || pal.base;
  if (variant === "crayon") {
    return `repeating-linear-gradient(48deg, rgba(0,0,0,.05) 0 14px, transparent 14px 28px), ${pal.base}`;
  }
  if (variant === "watercolor") {
    return `radial-gradient(circle at 26% 30%, ${pal.a} 0%, transparent 46%), radial-gradient(circle at 76% 72%, ${pal.b} 0%, transparent 46%), ${pal.base}`;
  }
  return pal.base;
}

export default function StoryPage({
  kind,
  title = "Untitled Story",
  value = "",
  accent = COLORS.blue,
  imageDesc = "",
  text = "",
  variant = "crayon",
  pageNum = 0,
}: StoryPageProps) {
  const isCover = kind === "cover";
  const isPage = !isCover;
  const pal = PALETTES[variant] ?? PALETTES.crayon;
  const illoBg = getIllustrationBg(kind, variant, accent);
  const showShapes = variant === "cutout" && isPage;
  const desc = imageDesc && imageDesc.trim() ? imageDesc : "illustration goes here";
  const caption = `✎  ${desc}`;

  return (
    <div
      data-testid="story-page"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        border: `3px solid ${COLORS.ink}`,
        borderRadius: 20,
        overflow: "hidden",
        background: COLORS.surface,
        boxShadow: SHADOW(5),
        fontFamily: FONTS.body,
      }}
    >
      <div
        style={{
          position: "relative",
          flex: "1 1 auto",
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: illoBg,
        }}
      >
        {showShapes && (
          <>
            <span
              style={{
                position: "absolute",
                left: "13%",
                top: "16%",
                width: "34%",
                aspectRatio: "1",
                borderRadius: "50%",
                background: pal.a,
                border: `3px solid ${COLORS.ink}`,
              }}
            />
            <span
              style={{
                position: "absolute",
                right: "11%",
                bottom: "18%",
                width: "30%",
                height: "34%",
                borderRadius: 16,
                background: pal.b,
                border: `3px solid ${COLORS.ink}`,
                transform: "rotate(-6deg)",
              }}
            />
          </>
        )}
        {isCover && (
          <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: 14 }}>
            <div
              data-testid="story-page-value"
              style={{
                display: "inline-block",
                background: COLORS.surface,
                border: `3px solid ${COLORS.ink}`,
                borderRadius: 999,
                padding: "5px 18px",
                fontFamily: FONTS.body,
                fontWeight: 700,
                fontSize: "clamp(11px,1.4vw,15px)",
                color: COLORS.ink,
                marginBottom: 16,
                boxShadow: SHADOW(3),
              }}
            >
              {value}
            </div>
            <h2
              data-testid="story-page-title"
              style={{
                fontFamily: FONTS.display,
                fontWeight: 700,
                fontSize: "clamp(24px,3.6vw,50px)",
                lineHeight: 1.02,
                color: COLORS.ink,
                margin: 0,
                textShadow: "2px 2px 0 rgba(255,255,255,.45)",
              }}
            >
              {title}
            </h2>
          </div>
        )}
        {isPage && (
          <span
            data-testid="story-page-caption"
            style={{
              position: "absolute",
              left: 14,
              bottom: 11,
              right: 14,
              fontFamily: FONTS.caption,
              fontSize: "clamp(9px,1.1vw,12px)",
              color: "rgba(30,27,46,.5)",
              lineHeight: 1.3,
              whiteSpace: "pre",
            }}
          >
            {caption}
          </span>
        )}
      </div>
      {isPage && (
        <div
          style={{
            flex: "0 0 auto",
            background: pal.band,
            borderTop: `3px solid ${COLORS.ink}`,
            padding: "clamp(15px,2.3vw,26px)",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <p
            data-testid="story-page-text"
            style={{
              flex: 1,
              margin: 0,
              fontFamily: FONTS.body,
              fontWeight: 500,
              fontSize: "clamp(14px,1.8vw,21px)",
              lineHeight: 1.5,
              color: "#2a2740",
            }}
          >
            {text}
          </p>
          <span
            data-testid="story-page-label"
            style={{
              flex: "0 0 auto",
              fontFamily: FONTS.display,
              fontWeight: 600,
              fontSize: "clamp(11px,1.3vw,14px)",
              color: "#9a95ad",
            }}
          >
            Page {pageNum}
          </span>
        </div>
      )}
    </div>
  );
}
