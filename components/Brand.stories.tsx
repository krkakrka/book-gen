import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Brand from "./Brand";

const meta: Meta<typeof Brand> = {
  title: "Components/Brand",
  component: Brand,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof Brand>;

export const Default: Story = {};

export const Large: Story = {
  args: { markSize: 48, markFontSize: 24, wordmarkFontSize: 28, shadow: 4, gap: 12 },
};
