import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ValueStep from "./ValueStep";

const meta: Meta<typeof ValueStep> = {
  title: "Components/Wizard/ValueStep",
  component: ValueStep,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ValueStep>;

export const NoneSelected: Story = {
  args: { selectedValueId: null, onSelect: () => {} },
};

export const Interactive: Story = {
  render: (args) => {
    const [selectedValueId, setSelectedValueId] = useState<string | null>(args.selectedValueId);
    return <ValueStep selectedValueId={selectedValueId} onSelect={setSelectedValueId} />;
  },
  args: { selectedValueId: "courage", onSelect: () => {} },
};
