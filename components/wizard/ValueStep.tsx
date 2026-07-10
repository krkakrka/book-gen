"use client";

import { useState } from "react";
import { VALUES, valueById } from "@/lib/data";
import { COLORS, FONTS, SHADOW } from "@/lib/tokens";

export interface ValueStepProps {
  selectedValueId: string | null;
  onSelect: (id: string) => void;
}

export default function ValueStep({ selectedValueId, onSelect }: ValueStepProps) {
  const [hoverValueId, setHoverValueId] = useState<string | null>(null);
  const displayValue = valueById(hoverValueId ?? selectedValueId);

  return (
    <>
      <h2 style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: "clamp(24px,3.2vw,34px)", margin: "0 0 8px" }}>
        What should this story teach?
      </h2>
      <p style={{ fontFamily: FONTS.body, color: COLORS.mutedText, margin: "0 0 24px" }}>
        Hover over a value to learn more, then tap to select.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        {VALUES.map((v) => {
          const selected = selectedValueId === v.id;
          return (
            <button
              key={v.id}
              data-testid="value-card"
              data-value-id={v.id}
              data-selected={selected ? "true" : "false"}
              onClick={() => onSelect(v.id)}
              onMouseEnter={() => setHoverValueId(v.id)}
              onMouseLeave={() => setHoverValueId(null)}
              style={{
                padding: "16px 14px",
                border: `3px solid ${COLORS.ink}`,
                borderRadius: 16,
                background: selected ? v.color : COLORS.surface,
                color: selected ? COLORS.surface : COLORS.ink,
                cursor: "pointer",
                textAlign: "left",
                boxShadow: SHADOW(4),
              }}
            >
              <div style={{ fontFamily: FONTS.display, fontWeight: 600, fontSize: 18, marginBottom: 4 }}>{v.name}</div>
              <div style={{ fontFamily: FONTS.body, fontSize: 12, opacity: 0.85 }}>{v.short}</div>
            </button>
          );
        })}
      </div>
      <div
        data-testid="value-definition"
        style={{
          background: COLORS.ink,
          color: COLORS.surface,
          borderRadius: 16,
          padding: "20px 24px",
          display: "flex",
          alignItems: "flex-start",
          gap: 16,
          minHeight: 80,
        }}
      >
        {displayValue ? (
          <>
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: displayValue.color,
                border: `2px solid ${COLORS.surface}`,
                flexShrink: 0,
                marginTop: 2,
              }}
            />
            <div>
              <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
                {displayValue.name}
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 14, lineHeight: 1.5, opacity: 0.9 }}>
                {displayValue.desc}
              </div>
            </div>
          </>
        ) : (
          <span style={{ fontFamily: FONTS.body, opacity: 0.6 }}>Select a value to see its definition.</span>
        )}
      </div>
    </>
  );
}
