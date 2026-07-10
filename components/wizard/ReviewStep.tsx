import StoryPage from "@/components/StoryPage";
import type { Section, StyleId } from "@/lib/types";
import { styleName } from "@/lib/data";
import { COLORS, FONTS, SHADOW } from "@/lib/tokens";

export interface ReviewStepProps {
  mode: "create" | "edit";
  title: string;
  value: string;
  valueId: string | null;
  accent: string;
  styleId: StyleId | null;
  sections: Section[];
  onDecline: () => void;
  onAccept: () => void;
}

export default function ReviewStep({
  mode,
  title,
  value,
  valueId,
  accent,
  styleId,
  sections,
  onDecline,
  onAccept,
}: ReviewStepProps) {
  return (
    <>
      <h2 style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: "clamp(24px,3.2vw,34px)", margin: "0 0 8px" }}>
        Review your book
      </h2>
      <p style={{ fontFamily: FONTS.body, color: COLORS.mutedText, margin: "0 0 24px" }}>
        Every page in {styleName(styleId)} style.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 20,
          marginBottom: 24,
        }}
      >
        <div data-testid="review-page" style={{ height: 280 }}>
          <StoryPage kind="cover" title={title} value={value} accent={accent} variant={styleId ?? "crayon"} />
        </div>
        {sections.map((section, i) => (
          <div key={i} data-testid="review-page" style={{ height: 280 }}>
            <StoryPage
              kind="page"
              imageDesc={section.imageDesc}
              text={section.text}
              variant={styleId ?? "crayon"}
              pageNum={i + 1}
              pageTotal={sections.length}
            />
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          background: COLORS.surface,
          border: `3px solid ${COLORS.ink}`,
          borderRadius: 16,
          padding: "16px 20px",
          boxShadow: SHADOW(4),
        }}
      >
        <span data-testid="review-summary" style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 15 }}>
          {sections.length} pages · teaches {valueId} · {styleName(styleId)} style
        </span>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            data-testid="decline-review"
            onClick={onDecline}
            style={{
              padding: "10px 18px",
              background: COLORS.surface,
              border: `3px solid ${COLORS.ink}`,
              borderRadius: 12,
              fontFamily: FONTS.body,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            ↩ Make changes
          </button>
          <button
            data-testid="accept-book"
            onClick={onAccept}
            style={{
              padding: "10px 18px",
              background: COLORS.green,
              color: COLORS.surface,
              border: `3px solid ${COLORS.ink}`,
              borderRadius: 12,
              fontFamily: FONTS.display,
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: SHADOW(3),
            }}
          >
            {mode === "edit" ? "✓ Save changes" : "✓ Add to library"}
          </button>
        </div>
      </div>
    </>
  );
}
