import { COLORS, FONTS, SHADOW } from "@/lib/tokens";

export interface ReaderHeaderProps {
  title: string;
  value: string;
  pageIndicator: string;
  onBack: () => void;
}

export default function ReaderHeader({ title, value, pageIndicator, onBack }: ReaderHeaderProps) {
  return (
    <header
      style={{
        background: COLORS.surface,
        borderBottom: `4px solid ${COLORS.ink}`,
        padding: "14px clamp(16px,3vw,32px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <button
        data-testid="reader-back"
        onClick={onBack}
        style={{
          background: COLORS.surface,
          border: `3px solid ${COLORS.ink}`,
          borderRadius: 12,
          padding: "8px 16px",
          fontFamily: FONTS.body,
          fontWeight: 600,
          fontSize: 14,
          cursor: "pointer",
          boxShadow: SHADOW(3),
        }}
      >
        ← Library
      </button>
      <div style={{ textAlign: "center", flex: 1 }}>
        <h1
          data-testid="reader-title"
          style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: "clamp(18px,2.5vw,24px)", margin: "0 0 2px" }}
        >
          {title}
        </h1>
        <span data-testid="reader-value" style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mutedText, fontWeight: 600 }}>
          {value}
        </span>
      </div>
      <span
        data-testid="page-indicator"
        style={{
          background: COLORS.yellow,
          border: `3px solid ${COLORS.ink}`,
          borderRadius: 999,
          padding: "6px 16px",
          fontFamily: FONTS.display,
          fontWeight: 600,
          fontSize: 13,
          whiteSpace: "nowrap",
        }}
      >
        {pageIndicator}
      </span>
    </header>
  );
}
