import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ReviewStep from "./ReviewStep";
import { seedBooks } from "@/lib/data";

const [courageBook] = seedBooks();

const meta: Meta<typeof ReviewStep> = {
  title: "Components/Wizard/ReviewStep",
  component: ReviewStep,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ReviewStep>;

export const CreateMode: Story = {
  args: {
    mode: "create",
    title: courageBook.title,
    value: courageBook.value,
    valueId: courageBook.valueId,
    accent: courageBook.accent,
    styleId: courageBook.styleId,
    sections: courageBook.sections,
    onDecline: () => {},
    onAccept: () => {},
  },
};

export const EditMode: Story = {
  args: {
    ...CreateMode.args,
    mode: "edit",
  },
};
