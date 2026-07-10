import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import BookCard from "./BookCard";
import { seedBooks } from "@/lib/data";

const [courageBook] = seedBooks();

const meta: Meta<typeof BookCard> = {
  title: "Components/BookCard",
  component: BookCard,
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
type Story = StoryObj<typeof BookCard>;

export const Default: Story = {
  args: {
    book: courageBook,
    onOpen: () => {},
    onEdit: () => {},
    onDelete: () => {},
  },
};
