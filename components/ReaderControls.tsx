import type { ReactNode } from "react";
import NavArrowButton from "@/components/NavArrowButton";
import { COLORS } from "@/lib/tokens";

export interface ReaderControlsProps {
  isCover: boolean;
  isLastPage: boolean;
  onPrev: () => void;
  onNext: () => void;
  children: ReactNode;
}

export default function ReaderControls({ isCover, isLastPage, onPrev, onNext, children }: ReaderControlsProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "clamp(12px,2vw,24px)",
        padding: "clamp(16px,3vw,32px)",
      }}
    >
      <NavArrowButton testId="reader-prev" direction="prev" disabled={isCover} onClick={onPrev} />
      <div style={{ width: "100%", maxWidth: 680, height: "min(74vh, 760px)", flexShrink: 1 }}>{children}</div>
      <NavArrowButton
        testId="reader-next"
        direction="next"
        disabled={isLastPage}
        onClick={onNext}
        enabledBackground={COLORS.yellow}
      />
    </div>
  );
}
