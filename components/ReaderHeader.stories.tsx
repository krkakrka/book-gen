import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ReaderHeader from "./ReaderHeader";

const meta: Meta<typeof ReaderHeader> = {
  title: "Components/ReaderHeader",
  component: ReaderHeader,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof ReaderHeader>;

export const Cover: Story = {
  args: {
    title: "Pip and the Whispering Forest",
    value: "Courage",
    pageIndicator: "Cover",
    onBack: () => {},
  },
};

export const OnAPage: Story = {
  args: {
    title: "Pip and the Whispering Forest",
    value: "Courage",
    pageIndicator: "Page 2 / 5",
    onBack: () => {},
  },
};
