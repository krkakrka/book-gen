import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import CreateTile from "./CreateTile";

const meta: Meta<typeof CreateTile> = {
  title: "Components/CreateTile",
  component: CreateTile,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: 230 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CreateTile>;

export const Default: Story = {
  args: { onClick: () => {} },
};
