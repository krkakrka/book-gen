import Brand from "@/components/Brand";
import { COLORS, FONTS } from "@/lib/tokens";

export default function LoginHero() {
  return (
    <div
      style={{
        flex: "1 1 420px",
        background: COLORS.yellow,
        borderRight: `4px solid ${COLORS.ink}`,
        padding: "clamp(32px,5vw,56px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: -40,
          right: -30,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: COLORS.pink,
          border: `3px solid ${COLORS.ink}`,
        }}
      />
      <span
        style={{
          position: "absolute",
          bottom: 60,
          left: -20,
          width: 80,
          height: 80,
          borderRadius: 8,
          background: COLORS.blue,
          border: `3px solid ${COLORS.ink}`,
        }}
      />
      <span
        style={{
          position: "absolute",
          bottom: -30,
          right: 80,
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: COLORS.green,
          border: `3px solid ${COLORS.ink}`,
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 32 }}>
          <Brand markSize={48} markFontSize={24} wordmarkFontSize={28} shadow={4} gap={12} />
        </div>
        <h1
          style={{
            fontFamily: FONTS.display,
            fontWeight: 700,
            fontSize: "clamp(32px,5vw,48px)",
            lineHeight: 1.1,
            margin: "0 0 16px",
            color: COLORS.ink,
          }}
        >
          Little stories that grow big hearts.
        </h1>
        <p style={{ fontFamily: FONTS.body, fontSize: 16, color: COLORS.mutedText, margin: 0, maxWidth: 360 }}>
          Create beautiful picture books that teach values to children ages 3–6.
        </p>
      </div>
    </div>
  );
}
