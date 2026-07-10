import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import StoryStep from "./StoryStep";
import { buildStories } from "@/lib/data";

const stories = buildStories("Courage");

const meta: Meta<typeof StoryStep> = {
  title: "Components/Wizard/StoryStep",
  component: StoryStep,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof StoryStep>;

export const NoneChosen: Story = {
  args: { value: "Courage", stories, storyId: null, onChoose: () => {} },
};

export const Interactive: Story = {
  render: (args) => {
    const [storyId, setStoryId] = useState<string | null>(args.storyId);
    return <StoryStep value={args.value} stories={args.stories} storyId={storyId} onChoose={setStoryId} />;
  },
  args: { value: "Courage", stories, storyId: "forest", onChoose: () => {} },
};
