import { COLORS, FONTS, SHADOW } from "@/lib/tokens";

export interface WizardFooterProps {
  step: number;
  canProceed: boolean;
  nextLabel: string;
  onPrev: () => void;
  onNext: () => void;
}

export default function WizardFooter({ step, canProceed, nextLabel, onPrev, onNext }: WizardFooterProps) {
  return (
    <footer
      style={{
        background: COLORS.surface,
        borderTop: `4px solid ${COLORS.ink}`,
        padding: "16px clamp(20px,3vw,40px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        bottom: 0,
        maxWidth: "100%",
      }}
    >
      <button
        data-testid="prev-step"
        disabled={step === 1}
        onClick={onPrev}
        style={{
          padding: "10px 20px",
          background: step === 1 ? "#eee7d2" : COLORS.surface,
          border: `3px solid ${COLORS.ink}`,
          borderRadius: 12,
          fontFamily: FONTS.body,
          fontWeight: 600,
          fontSize: 14,
          cursor: step === 1 ? "default" : "pointer",
          boxShadow: step === 1 ? "none" : SHADOW(3),
        }}
      >
        ← Back
      </button>
      <span data-testid="step-counter" style={{ fontFamily: FONTS.display, fontWeight: 600, fontSize: 16 }}>
        Step {step} of 5
      </span>
      <button
        data-testid="next-step"
        disabled={!canProceed}
        onClick={onNext}
        style={{
          padding: "10px 20px",
          background: canProceed ? COLORS.pink : COLORS.inputBorder,
          color: canProceed ? COLORS.surface : COLORS.mutedText,
          border: `3px solid ${COLORS.ink}`,
          borderRadius: 12,
          fontFamily: FONTS.display,
          fontWeight: 600,
          fontSize: 14,
          cursor: canProceed ? "pointer" : "not-allowed",
          boxShadow: canProceed ? SHADOW(3) : "none",
        }}
      >
        {nextLabel}
      </button>
    </footer>
  );
}
