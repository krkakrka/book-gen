import type { Book, StoryTemplate, StyleDef, ValueDef } from "./types";

/**
 * Deterministic spec data ported from the design prototype
 * (design/design_files/Storyseed.dc.html). This is reference content, not UI.
 * Tests assert against the exact copy here.
 */

export const VALUES: ValueDef[] = [
  { id: "courage", name: "Courage", color: "#2E6BFF", short: "being brave", desc: "Someone who tries even when they feel scared or unsure." },
  { id: "kindness", name: "Kindness", color: "#FF4D6D", short: "caring", desc: "Someone who cares about how others feel and helps them." },
  { id: "honesty", name: "Honesty", color: "#2BC48A", short: "truthful", desc: "Someone who tells the truth, even when it is hard." },
  { id: "patience", name: "Patience", color: "#9B6BFF", short: "calm waiting", desc: "Someone who can wait calmly without getting upset." },
  { id: "generosity", name: "Generosity", color: "#FF8A3D", short: "sharing", desc: "Someone who loves to share what they have with others." },
  { id: "perseverance", name: "Perseverance", color: "#00BBD1", short: "never giving up", desc: "Someone who keeps trying and does not give up easily." },
  { id: "responsibility", name: "Responsibility", color: "#C879FF", short: "follows through", desc: "Someone who takes ownership and follows through on what they promise." },
  { id: "empathy", name: "Empathy", color: "#FF6FB5", short: "understanding", desc: "Someone who understands and shares the feelings of others." },
  { id: "gratitude", name: "Gratitude", color: "#7BC043", short: "thankful", desc: "Someone who notices good things and remembers to say thank you." },
];

export const STYLES: StyleDef[] = [
  { id: "crayon", name: "Crayon Doodle", desc: "warm, hand-drawn, sunny" },
  { id: "cutout", name: "Paper Cut-out", desc: "bold flat shapes, playful" },
  { id: "watercolor", name: "Soft Watercolor", desc: "dreamy washes of color" },
];

export const STORAGE_KEY = "storyseed.books.v1";

export function valueById(id: string | null | undefined): ValueDef | undefined {
  return VALUES.find((v) => v.id === id);
}

export function styleName(id: string | null | undefined): string {
  const st = STYLES.find((x) => x.id === id);
  return st ? st.name : "Crayon Doodle";
}

/**
 * Build the three template stories for a given value name.
 * Mirrors the prototype's buildStories(valueName).
 */
export function buildStories(valueName: string): StoryTemplate[] {
  const vl = (valueName || "kindness").toLowerCase();
  return [
    {
      id: "forest",
      title: "Pip and the Whispering Forest",
      emoji: "🦊",
      dot: "#FF8A3D",
      blurb: "A shy little fox discovers his " + vl + " deep in the woods.",
      full:
        "Pip the fox loved his cozy corner of the forest, but the dark paths beyond the old oak always made his tail tremble.\n\nWhen a tiny bird gets lost in the shadows, Pip must decide whether to stay safe at home or step into the unknown to help.\n\nWith every careful step, Pip learns that " +
        vl +
        " does not mean you are never afraid — it means you try anyway.",
      sections: [
        { imageDesc: "A small orange fox peeking out from behind a giant oak tree at the edge of a sunny forest", text: "Pip the fox loved his cozy corner of the forest. But the tall, dark trees beyond the old oak always made his tail tremble." },
        { imageDesc: "A tiny lost bird shivering alone on a branch deep in the shadowy woods", text: "One morning, Pip heard a tiny cry. A little bird was lost, all alone, where the shadows grew long and deep." },
        { imageDesc: "The fox takes a careful first step onto the dark forest path, ears held back", text: "Pip’s heart went thump-thump-thump. The path looked so dark and scary. But the bird needed help right now." },
        { imageDesc: "The brave fox walks through the woods with the bird, fireflies lighting the way", text: "So Pip took one brave step, and then another. With every step, his " + vl + " grew a little bigger and brighter." },
        { imageDesc: "The fox and a happy bird family reunited in a glowing treetop home at sunset", text: "Pip found the bird’s family safe and warm. Being brave didn’t mean he was never scared — it meant he tried anyway." },
      ],
    },
    {
      id: "meadow",
      title: "Bo the Bunny’s Big Day",
      emoji: "🐰",
      dot: "#2BC48A",
      blurb: "A bouncy bunny learns about " + vl + " on the sunniest day in the meadow.",
      full:
        "Bo the bunny was the fastest hopper in the whole sunny meadow, and everyone knew it.\n\nBut on the day of the big Meadow Games, something happens that the fastest hopper cannot solve with speed alone.\n\nBo learns that " +
        vl +
        " can matter even more than being first.",
      sections: [
        { imageDesc: "A cheerful white bunny stretching at the start line of a race in a bright flowery meadow", text: "Bo the bunny was the fastest hopper in the whole meadow. Today was the big Meadow Games, and Bo could not wait!" },
        { imageDesc: "A small turtle tripping and dropping a basket of berries near the racing path", text: "Just as the race began, Bo saw little Theo the turtle tumble over, spilling his basket of ripe red berries everywhere." },
        { imageDesc: "The bunny pausing mid-hop, looking back at the struggling turtle while others race ahead", text: "Bo stopped. The finish line was so close. But Theo looked sad, and nobody else had stopped to help." },
        { imageDesc: "The bunny helping the turtle gather berries together, both smiling warmly", text: "Bo hopped back and helped gather every last berry. It was slow work, but showing " + vl + " felt better than winning." },
        { imageDesc: "The bunny and turtle sharing the berries together under a big sunflower as friends cheer", text: "They missed the finish line, but they shared the berries together. Bo had won something even better — a brand new friend." },
      ],
    },
    {
      id: "river",
      title: "Tilly Bear and the Rushing River",
      emoji: "🐻",
      dot: "#2E6BFF",
      blurb: "A gentle bear cub finds her " + vl + " beside a wild, rushing river.",
      full:
        "Tilly was the smallest bear cub by the great rushing river, and sometimes the world felt very big.\n\nWhen a storm scatters her family’s winter berries across the riverbank, Tilly faces a problem far bigger than she is.\n\nStep by patient step, Tilly discovers that " +
        vl +
        " lives inside even the smallest of us.",
      sections: [
        { imageDesc: "A tiny round bear cub standing beside a wide rushing blue river under tall pine trees", text: "Tilly was the smallest bear cub by the great rushing river. Sometimes, the whole world felt much too big for her." },
        { imageDesc: "A sudden storm scattering bright berries all across a muddy riverbank", text: "One night a storm came roaring through and scattered her family’s winter berries all across the slippery bank." },
        { imageDesc: "The little bear looking at the huge mess of scattered berries, ears drooping", text: "In the morning, Tilly saw the mess. It looked impossible. “I’m too small,” she sighed. “I could never fix all this.”" },
        { imageDesc: "The bear cub carefully placing berries one by one into a woven basket", text: "But Tilly began anyway — one berry, then two, then ten. Her " + vl + " carried her on, even when her paws grew tired." },
        { imageDesc: "The whole bear family hugging beside a full basket of berries at golden sunrise", text: "By sunrise the basket was full. Her family hugged her tight. Tilly learned that big things are done by small, steady steps." },
      ],
    },
  ];
}

/** The 3 sample books seeded on first load. */
export function seedBooks(): Book[] {
  const mk = (valueId: string, storyIdx: number, styleId: Book["styleId"]): Book => {
    const v = valueById(valueId)!;
    const stories = buildStories(v.name);
    const st = stories[storyIdx];
    return {
      id: "seed-" + valueId + "-" + storyIdx,
      valueId,
      value: v.name,
      accent: v.color,
      title: st.title,
      storyId: st.id,
      styleId,
      sections: st.sections.map((s) => ({ ...s })),
    };
  };
  return [mk("courage", 0, "crayon"), mk("kindness", 1, "cutout"), mk("perseverance", 2, "watercolor")];
}
