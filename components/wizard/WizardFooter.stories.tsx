import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import WizardFooter from "./WizardFooter";

const meta: Meta<typeof WizardFooter> = {
  title: "Components/Wizard/WizardFooter",
  component: WizardFooter,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof WizardFooter>;

export const Step1Blocked: Story = {
  args: { step: 1, canProceed: false, nextLabel: "Next →", onPrev: () => {}, onNext: () => {} },
};

export const StepReady: Story = {
  args: { step: 2, canProceed: true, nextLabel: "Next →", onPrev: () => {}, onNext: () => {} },
};

export const Step4Review: Story = {
  args: { step: 4, canProceed: true, nextLabel: "Review →", onPrev: () => {}, onNext: () => {} },
};
