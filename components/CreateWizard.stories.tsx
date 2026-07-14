import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import CreateWizard from "./CreateWizard";

// Note: CreateWizard now requires a real backend session and fetches/persists
// books via the /api/books/ API (see lib/storage.ts), so these stories need a
// running, authenticated backend to render past the session check.
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
};

export const EditExistingBook: Story = {
  name: "Edit — existing book (step 1)",
  args: { mode: "edit", editId: "seed-courage-0" },
};
