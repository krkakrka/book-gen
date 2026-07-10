export type StyleId = "crayon" | "cutout" | "watercolor";

export interface Section {
  /** Illustration description (placeholder art today). */
  imageDesc: string;
  /** Narrator text shown on the page. */
  text: string;
}

export interface Book {
  id: string;
  valueId: string; // e.g. "courage"
  value: string; // display name e.g. "Courage"
  accent: string; // hex, derived from the value
  title: string;
  storyId: string; // which template story was chosen
  styleId: StyleId;
  sections: Section[];
}

export interface ValueDef {
  id: string;
  name: string;
  color: string;
  short: string;
  desc: string;
}

export interface StyleDef {
  id: StyleId;
  name: string;
  desc: string;
}

export interface StoryTemplate {
  id: string;
  title: string;
  emoji: string;
  dot: string;
  blurb: string;
  full: string;
  sections: Section[];
}
