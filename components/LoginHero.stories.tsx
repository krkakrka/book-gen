import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import LoginHero from "./LoginHero";

const meta: Meta<typeof LoginHero> = {
  title: "Components/LoginHero",
  component: LoginHero,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof LoginHero>;

export const Default: Story = {};
