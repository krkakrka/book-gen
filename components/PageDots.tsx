import { COLORS } from "@/lib/tokens";

export interface PageDotsProps {
  total: number;
  active: number;
  onSelect: (index: number) => void;
}

export default function PageDots({ total, active, onSelect }: PageDotsProps) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "20px 16px 32px" }}>
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          data-testid="reader-dot"
          data-active={i === active ? "true" : "false"}
          onClick={() => onSelect(i)}
          style={{
            width: i === active ? 26 : 11,
            height: 11,
            borderRadius: 999,
            border: `2px solid ${COLORS.ink}`,
            background: i === active ? COLORS.pink : COLORS.surface,
            cursor: "pointer",
            padding: 0,
            transition: "width 0.12s",
          }}
          aria-label={`Go to page ${i === 0 ? "cover" : i}`}
        />
      ))}
    </div>
  );
}
