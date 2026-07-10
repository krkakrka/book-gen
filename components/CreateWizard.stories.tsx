import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import CreateWizard from "./CreateWizard";
import { seedBooks } from "@/lib/data";
import { persistBooks } from "@/lib/storage";

const meta: Meta<typeof CreateWizard> = {
  title: "Components/CreateWizard",
  component: CreateWizard,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof CreateWizard>;

export const CreateStep1Value: Story = {
  name: "Create — Step 1 (value)",
  args: { mode: "create" },
  beforeEach: async () => {
    window.localStorage.clear();
  },
};

export const EditExistingBook: Story = {
  name: "Edit — existing book (step 1)",
  args: { mode: "edit", editId: "seed-courage-0" },
  beforeEach: async () => {
    persistBooks(seedBooks());
  },
};
