import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import WizardHeader from "./WizardHeader";

const meta: Meta<typeof WizardHeader> = {
  title: "Components/Wizard/WizardHeader",
  component: WizardHeader,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof WizardHeader>;

export const CreateStep1: Story = {
  args: { mode: "create", step: 1, onCancel: () => {}, onStepClick: () => {} },
};

export const CreateStep3: Story = {
  args: { mode: "create", step: 3, onCancel: () => {}, onStepClick: () => {} },
};

export const EditMode: Story = {
  args: { mode: "edit", step: 5, onCancel: () => {}, onStepClick: () => {} },
};
