import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import PagesStep from "./PagesStep";
import type { Section } from "@/lib/types";
import { buildStories } from "@/lib/data";

const initialSections = buildStories("Courage")[0].sections;

const meta: Meta<typeof PagesStep> = {
  title: "Components/Wizard/PagesStep",
  component: PagesStep,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof PagesStep>;

export const Filled: Story = {
  args: {
    title: "Pip and the Whispering Forest",
    sections: initialSections,
    onTitleChange: () => {},
    onUpdateSection: () => {},
    onRemoveSection: () => {},
    onAddSection: () => {},
  },
};

export const Interactive: Story = {
  render: (args) => {
    const [title, setTitle] = useState(args.title);
    const [sections, setSections] = useState<Section[]>(args.sections);
    return (
      <PagesStep
        title={title}
        onTitleChange={setTitle}
        sections={sections}
        onUpdateSection={(index, field, value) =>
          setSections((s) => s.map((sec, i) => (i === index ? { ...sec, [field]: value } : sec)))
        }
        onRemoveSection={(index) => setSections((s) => s.filter((_, i) => i !== index))}
        onAddSection={() => setSections((s) => [...s, { imageDesc: "", text: "" }])}
      />
    );
  },
  args: {
    title: "Pip and the Whispering Forest",
    sections: initialSections,
    onTitleChange: () => {},
    onUpdateSection: () => {},
    onRemoveSection: () => {},
    onAddSection: () => {},
  },
};

export const EmptyNarratorGatesNext: Story = {
  name: "Empty narrator text (invalid state)",
  args: {
    title: "Untitled",
    sections: [{ imageDesc: "A quiet scene", text: "" }],
    onTitleChange: () => {},
    onUpdateSection: () => {},
    onRemoveSection: () => {},
    onAddSection: () => {},
  },
};
