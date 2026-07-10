import { COLORS, FONTS, SHADOW } from "@/lib/tokens";

const STEP_LABELS = ["Value", "Story", "Pages", "Style", "Review"];

function getStepState(step: number, current: number): "active" | "done" | "future" {
  if (step === current) return "active";
  if (step < current) return "done";
  return "future";
}

export interface WizardHeaderProps {
  mode: "create" | "edit";
  step: number;
  onCancel: () => void;
  onStepClick: (target: number) => void;
}

export default function WizardHeader({ mode, step, onCancel, onStepClick }: WizardHeaderProps) {
  return (
    <header
      style={{
        background: COLORS.surface,
        borderBottom: `4px solid ${COLORS.ink}`,
        padding: "16px clamp(20px,3vw,40px)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          maxWidth: 1080,
          margin: "0 auto 20px",
        }}
      >
        <h1
          data-testid="wizard-heading"
          style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: "clamp(22px,3vw,30px)", margin: 0 }}
        >
          {mode === "edit" ? "Edit story" : "Create a new story"}
        </h1>
        <button
          data-testid="wizard-cancel"
          onClick={onCancel}
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
          ✕ Cancel
        </button>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
          maxWidth: 1080,
          margin: "0 auto",
        }}
      >
        {STEP_LABELS.map((label, i) => {
          const s = i + 1;
          const state = getStepState(s, step);
          const isActive = state === "active";
          const isDone = state === "done";
          return (
            <div key={s} style={{ display: "flex", alignItems: "center" }}>
              <button
                data-testid="step-node"
                data-step={s}
                data-state={state}
                onClick={() => onStepClick(s)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  background: "none",
                  border: "none",
                  cursor: s <= step ? "pointer" : "default",
                  padding: "0 8px",
                }}
              >
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: `3px solid ${COLORS.ink}`,
                    background: isActive ? COLORS.pink : isDone ? COLORS.green : COLORS.surface,
                    color: isActive || isDone ? COLORS.surface : COLORS.ink,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: FONTS.display,
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {isDone ? "✓" : s}
                </span>
                <span
                  style={{
                    fontFamily: FONTS.body,
                    fontWeight: 600,
                    fontSize: 11,
                    color: isActive ? COLORS.pink : COLORS.mutedText,
                  }}
                >
                  {label}
                </span>
              </button>
              {s < 5 && (
                <div
                  style={{
                    width: 40,
                    height: 3,
                    background: s < step ? COLORS.green : COLORS.inputBorder,
                    margin: "0 4px",
                    marginBottom: 20,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </header>
  );
}
