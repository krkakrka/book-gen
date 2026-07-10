import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import StyleStep from "./StyleStep";
import type { StyleId } from "@/lib/types";
import { buildStories } from "@/lib/data";

const previewSection = buildStories("Courage")[0].sections[0];

const meta: Meta<typeof StyleStep> = {
  title: "Components/Wizard/StyleStep",
  component: StyleStep,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof StyleStep>;

export const NoneSelected: Story = {
  args: {
    selectedStyleId: null,
    onSelect: () => {},
    previewImageDesc: previewSection.imageDesc,
    previewText: previewSection.text,
    previewPageTotal: 5,
  },
};

export const Interactive: Story = {
  render: (args) => {
    const [selectedStyleId, setSelectedStyleId] = useState<StyleId | null>(args.selectedStyleId);
    return (
      <StyleStep
        selectedStyleId={selectedStyleId}
        onSelect={setSelectedStyleId}
        previewImageDesc={args.previewImageDesc}
        previewText={args.previewText}
        previewPageTotal={args.previewPageTotal}
      />
    );
  },
  args: {
    selectedStyleId: "cutout",
    onSelect: () => {},
    previewImageDesc: previewSection.imageDesc,
    previewText: previewSection.text,
    previewPageTotal: 5,
  },
};
