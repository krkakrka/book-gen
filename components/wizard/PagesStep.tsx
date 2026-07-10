import type { Section } from "@/lib/types";
import { COLORS, FONTS, SHADOW } from "@/lib/tokens";

export interface PagesStepProps {
  title: string;
  onTitleChange: (title: string) => void;
  sections: Section[];
  onUpdateSection: (index: number, field: keyof Section, value: string) => void;
  onRemoveSection: (index: number) => void;
  onAddSection: () => void;
}

export default function PagesStep({
  title,
  onTitleChange,
  sections,
  onUpdateSection,
  onRemoveSection,
  onAddSection,
}: PagesStepProps) {
  return (
    <>
      <h2 style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: "clamp(24px,3.2vw,34px)", margin: "0 0 24px" }}>
        Build the pages.
      </h2>
      <label style={{ display: "block", marginBottom: 24, maxWidth: 520 }}>
        <span style={{ display: "block", fontFamily: FONTS.body, fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
          Story title
        </span>
        <input
          data-testid="story-title-input"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          style={{
            width: "100%",
            padding: 14,
            border: `3px solid ${COLORS.ink}`,
            borderRadius: 12,
            fontFamily: FONTS.body,
            fontSize: 15,
          }}
        />
      </label>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
        {sections.map((section, index) => (
          <div
            key={index}
            data-testid="page-card"
            data-index={index}
            style={{
              border: `3px solid ${COLORS.ink}`,
              borderRadius: 16,
              overflow: "hidden",
              background: COLORS.surface,
              boxShadow: SHADOW(4),
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: COLORS.softYellowBand,
                borderBottom: `3px solid ${COLORS.ink}`,
              }}
            >
              <span style={{ fontFamily: FONTS.display, fontWeight: 600, fontSize: 16 }}>Page {index + 1}</span>
              <button
                data-testid="remove-page"
                onClick={() => onRemoveSection(index)}
                style={{
                  background: COLORS.surface,
                  border: `2px solid ${COLORS.ink}`,
                  borderRadius: 8,
                  padding: "4px 12px",
                  fontFamily: FONTS.body,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 16,
                padding: 16,
              }}
            >
              <label>
                <span style={{ display: "block", fontFamily: FONTS.body, fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                  🖼 Picture
                </span>
                <textarea
                  data-testid="page-image-input"
                  value={section.imageDesc}
                  onChange={(e) => onUpdateSection(index, "imageDesc", e.target.value)}
                  rows={4}
                  style={{
                    width: "100%",
                    padding: 12,
                    border: `2px solid ${COLORS.inputBorder}`,
                    borderRadius: 12,
                    fontFamily: FONTS.body,
                    fontSize: 14,
                    resize: "vertical",
                  }}
                />
              </label>
              <label>
                <span style={{ display: "block", fontFamily: FONTS.body, fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                  🗣 Narrator text
                </span>
                <textarea
                  data-testid="page-text-input"
                  value={section.text}
                  onChange={(e) => onUpdateSection(index, "text", e.target.value)}
                  rows={4}
                  style={{
                    width: "100%",
                    padding: 12,
                    border: `2px solid ${COLORS.inputBorder}`,
                    borderRadius: 12,
                    fontFamily: FONTS.body,
                    fontSize: 14,
                    resize: "vertical",
                  }}
                />
              </label>
            </div>
          </div>
        ))}
      </div>
      <button
        data-testid="add-page"
        onClick={onAddSection}
        style={{
          width: "100%",
          padding: "14px",
          background: COLORS.surface,
          border: `3px dashed ${COLORS.green}`,
          borderRadius: 14,
          fontFamily: FONTS.display,
          fontWeight: 600,
          fontSize: 16,
          color: COLORS.green,
          cursor: "pointer",
        }}
      >
        + Add a page
      </button>
    </>
  );
}
