import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import PageDots from "./PageDots";

const meta: Meta<typeof PageDots> = {
  title: "Components/PageDots",
  component: PageDots,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof PageDots>;

export const OnCover: Story = {
  args: { total: 6, active: 0, onSelect: () => {} },
};

export const MidBook: Story = {
  render: (args) => {
    const [active, setActive] = useState(args.active);
    return <PageDots total={args.total} active={active} onSelect={setActive} />;
  },
  args: { total: 6, active: 2, onSelect: () => {} },
};
