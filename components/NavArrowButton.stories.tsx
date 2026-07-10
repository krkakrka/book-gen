import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import NavArrowButton from "./NavArrowButton";
import { COLORS } from "@/lib/tokens";

const meta: Meta<typeof NavArrowButton> = {
  title: "Components/NavArrowButton",
  component: NavArrowButton,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof NavArrowButton>;

export const Prev: Story = {
  args: { testId: "reader-prev", direction: "prev", disabled: false, onClick: () => {} },
};

export const PrevDisabled: Story = {
  args: { testId: "reader-prev", direction: "prev", disabled: true, onClick: () => {} },
};

export const Next: Story = {
  args: { testId: "reader-next", direction: "next", disabled: false, onClick: () => {}, enabledBackground: COLORS.yellow },
};
