/**
 * Design tokens for the "Bold Pop" visual language.
 * Source of truth: design/README.md. Use these in components rather than
 * hard-coding hex values, so tests and UI stay in sync.
 */
export const COLORS = {
  ink: "#1E1B2E",
  canvas: "#FFFDF7",
  readerCanvas: "#FFF6E0",
  surface: "#FFFFFF",
  yellow: "#FFD23F",
  pink: "#FF4D6D",
  green: "#2BC48A",
  blue: "#2E6BFF",
  purple: "#9B6BFF",
  orange: "#FF8A3D",
  softYellowBand: "#FFF1C2",
  mutedText: "#6b6680",
  mutedText2: "#8a85a0",
  inputBorder: "#d9d5e8",
} as const;

export const SHADOW = (n: 1 | 2 | 3 | 4 | 5 | 6) => `${n}px ${n}px 0 ${COLORS.ink}`;

export const HOVER_MOTION = {
  default: { boxShadow: SHADOW(4) },
  hover: { transform: "translate(-2px,-2px)", boxShadow: SHADOW(6) },
  active: { transform: "translate(2px,2px)", boxShadow: SHADOW(1) },
} as const;

export const FONTS = {
  display: "'Fredoka', sans-serif",
  body: "'Poppins', sans-serif",
  caption: "'Courier New', monospace",
} as const;
