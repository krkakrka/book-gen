"use client";

import { useState } from "react";
import type { StoryTemplate } from "@/lib/types";
import { COLORS, FONTS, SHADOW } from "@/lib/tokens";

export interface StoryStepProps {
  value: string;
  stories: StoryTemplate[];
  storyId: string | null;
  onChoose: (storyId: string) => void;
}

export default function StoryStep({ value, stories, storyId, onChoose }: StoryStepProps) {
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);

  return (
    <>
      <h2 style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: "clamp(24px,3.2vw,34px)", margin: "0 0 8px" }}>
        Choose a story
      </h2>
      <p style={{ fontFamily: FONTS.body, color: COLORS.mutedText, margin: "0 0 24px" }}>
        Three tales about {value.toLowerCase()}. Tap a title to read it, then pick your favorite.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {stories.map((story) => {
          const expanded = expandedStoryId === story.id;
          const chosen = storyId === story.id;
          return (
            <div
              key={story.id}
              data-testid="story-card"
              data-story-id={story.id}
              data-chosen={chosen ? "true" : "false"}
              style={{
                border: `3px solid ${COLORS.ink}`,
                borderRadius: 16,
                overflow: "hidden",
                background: COLORS.surface,
                boxShadow: chosen ? `5px 5px 0 ${COLORS.pink}` : SHADOW(4),
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "16px 20px",
                  background: chosen ? COLORS.softYellowBand : COLORS.surface,
                }}
              >
                <span style={{ fontSize: 28 }}>{story.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FONTS.display, fontWeight: 600, fontSize: 18 }}>{story.title}</div>
                  <div style={{ fontFamily: FONTS.body, fontSize: 13, color: COLORS.mutedText }}>{story.blurb}</div>
                </div>
                <button
                  data-testid="story-toggle"
                  onClick={() => setExpandedStoryId(expanded ? null : story.id)}
                  style={{
                    background: COLORS.surface,
                    border: `3px solid ${COLORS.ink}`,
                    borderRadius: 10,
                    padding: "6px 12px",
                    fontFamily: FONTS.body,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {expanded ? "Hide ▲" : "Read ▼"}
                </button>
              </div>
              {expanded && (
                <div style={{ padding: "16px 20px 20px", borderTop: `3px solid ${COLORS.ink}` }}>
                  <p
                    data-testid="story-full"
                    style={{
                      fontFamily: FONTS.body,
                      fontSize: 14,
                      lineHeight: 1.7,
                      whiteSpace: "pre-line",
                      margin: "0 0 16px",
                      color: COLORS.ink,
                    }}
                  >
                    {story.full}
                  </p>
                  <button
                    data-testid="story-choose"
                    onClick={() => onChoose(story.id)}
                    style={{
                      padding: "10px 20px",
                      background: chosen ? COLORS.green : COLORS.pink,
                      color: COLORS.surface,
                      border: `3px solid ${COLORS.ink}`,
                      borderRadius: 12,
                      fontFamily: FONTS.display,
                      fontWeight: 600,
                      fontSize: 15,
                      cursor: "pointer",
                      boxShadow: SHADOW(3),
                    }}
                  >
                    {chosen ? "✓ Chosen" : "Choose this story"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
