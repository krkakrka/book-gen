import StoryPage from "@/components/StoryPage";
import type { StyleId } from "@/lib/types";
import { STYLES } from "@/lib/data";
import { COLORS, FONTS, SHADOW } from "@/lib/tokens";

export interface StyleStepProps {
  selectedStyleId: StyleId | null;
  onSelect: (id: StyleId) => void;
  previewImageDesc: string;
  previewText: string;
  previewPageTotal: number;
}

export default function StyleStep({
  selectedStyleId,
  onSelect,
  previewImageDesc,
  previewText,
  previewPageTotal,
}: StyleStepProps) {
  return (
    <>
      <h2 style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: "clamp(24px,3.2vw,34px)", margin: "0 0 8px" }}>
        Pick an art style
      </h2>
      <p style={{ fontFamily: FONTS.body, color: COLORS.mutedText, margin: "0 0 24px" }}>
        Here is page 1 in three styles.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
        {STYLES.map((style) => {
          const selected = selectedStyleId === style.id;
          return (
            <button
              key={style.id}
              data-testid="style-card"
              data-style-id={style.id}
              data-selected={selected ? "true" : "false"}
              onClick={() => onSelect(style.id)}
              style={{
                border: `3px solid ${COLORS.ink}`,
                borderRadius: 16,
                padding: 12,
                background: selected ? "#FFF0F3" : COLORS.surface,
                cursor: "pointer",
                textAlign: "left",
                boxShadow: selected ? `0 0 0 3px ${COLORS.pink}` : SHADOW(4),
                position: "relative",
              }}
            >
              {selected && (
                <span
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: COLORS.green,
                    border: `2px solid ${COLORS.ink}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: COLORS.surface,
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  ✓
                </span>
              )}
              <div style={{ height: 200, marginBottom: 12 }}>
                <StoryPage
                  kind="page"
                  imageDesc={previewImageDesc}
                  text={previewText}
                  variant={style.id}
                  pageNum={1}
                  pageTotal={previewPageTotal}
                />
              </div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 600, fontSize: 16 }}>{style.name}</div>
              <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mutedText }}>{style.desc}</div>
            </button>
          );
        })}
      </div>
    </>
  );
}
