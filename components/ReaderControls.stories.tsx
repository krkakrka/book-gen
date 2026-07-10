import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ReaderControls from "./ReaderControls";
import StoryPage from "./StoryPage";
import { seedBooks } from "@/lib/data";

const [courageBook] = seedBooks();

const meta: Meta<typeof ReaderControls> = {
  title: "Components/ReaderControls",
  component: ReaderControls,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ height: 500, display: "flex" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ReaderControls>;

export const OnCover: Story = {
  args: {
    isCover: true,
    isLastPage: false,
    onPrev: () => {},
    onNext: () => {},
    children: (
      <StoryPage
        kind="cover"
        title={courageBook.title}
        value={courageBook.value}
        accent={courageBook.accent}
        variant={courageBook.styleId}
      />
    ),
  },
};

export const MidBook: Story = {
  args: {
    isCover: false,
    isLastPage: false,
    onPrev: () => {},
    onNext: () => {},
    children: (
      <StoryPage
        kind="page"
        imageDesc={courageBook.sections[0].imageDesc}
        text={courageBook.sections[0].text}
        variant={courageBook.styleId}
        pageNum={1}
        pageTotal={courageBook.sections.length}
      />
    ),
  },
};
