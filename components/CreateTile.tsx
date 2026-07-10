import { COLORS, FONTS, SHADOW } from "@/lib/tokens";

export interface CreateTileProps {
  onClick: () => void;
}

export default function CreateTile({ onClick }: CreateTileProps) {
  return (
    <button
      data-testid="create-tile"
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 330,
        background: COLORS.canvas,
        border: `3px dashed ${COLORS.green}`,
        borderRadius: 20,
        cursor: "pointer",
        padding: 24,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          background: COLORS.green,
          border: `3px solid ${COLORS.ink}`,
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          color: COLORS.surface,
          marginBottom: 16,
          boxShadow: SHADOW(4),
        }}
      >
        +
      </div>
      <span style={{ fontFamily: FONTS.display, fontWeight: 600, fontSize: 18, color: COLORS.ink }}>
        Create a story
      </span>
      <span style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mutedText, marginTop: 6 }}>
        teach a value in 5 steps
      </span>
    </button>
  );
}
