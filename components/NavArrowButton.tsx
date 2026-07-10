import { COLORS, SHADOW } from "@/lib/tokens";

export interface NavArrowButtonProps {
  testId: string;
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
  enabledBackground?: string;
}

export default function NavArrowButton({
  testId,
  direction,
  disabled,
  onClick,
  enabledBackground = COLORS.surface,
}: NavArrowButtonProps) {
  return (
    <button
      data-testid={testId}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: 56,
        height: 56,
        borderRadius: "50%",
        border: `3px solid ${COLORS.ink}`,
        background: disabled ? "#eee7d2" : enabledBackground,
        fontSize: 28,
        cursor: disabled ? "default" : "pointer",
        boxShadow: disabled ? "none" : SHADOW(4),
        flexShrink: 0,
      }}
    >
      {direction === "prev" ? "‹" : "›"}
    </button>
  );
}
