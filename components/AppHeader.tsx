import Brand from "@/components/Brand";
import { COLORS, FONTS, SHADOW } from "@/lib/tokens";

export interface AppHeaderProps {
  userName: string;
  onSignOut: () => void;
}

export default function AppHeader({ userName, onSignOut }: AppHeaderProps) {
  return (
    <header
      style={{
        background: COLORS.yellow,
        borderBottom: `4px solid ${COLORS.ink}`,
        padding: "14px clamp(20px,3vw,40px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Brand />
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span
          style={{
            background: COLORS.surface,
            border: `3px solid ${COLORS.ink}`,
            borderRadius: 999,
            padding: "6px 16px",
            fontFamily: FONTS.body,
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          Library
        </span>
        <div
          data-testid="user-avatar"
          style={{
            width: 36,
            height: 36,
            background: COLORS.blue,
            border: `3px solid ${COLORS.ink}`,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: COLORS.surface,
            fontFamily: FONTS.display,
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {userName.charAt(0)}
        </div>
        <button
          data-testid="signout-button"
          onClick={onSignOut}
          style={{
            background: "none",
            border: "none",
            fontFamily: FONTS.body,
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            color: COLORS.ink,
            textDecoration: "underline",
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
