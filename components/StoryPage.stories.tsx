import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import StoryPage from "./StoryPage";
import { seedBooks } from "@/lib/data";

const [courageBook, kindnessBook, perseveranceBook] = seedBooks();

const meta: Meta<typeof StoryPage> = {
  title: "Components/StoryPage",
  component: StoryPage,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: 320, height: 420 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    kind: { control: "radio", options: ["cover", "page"] },
    variant: { control: "radio", options: ["crayon", "cutout", "watercolor"] },
  },
};

export default meta;
type Story = StoryObj<typeof StoryPage>;

export const Playground: Story = {
  args: {
    kind: "cover",
    title: courageBook.title,
    value: courageBook.value,
    accent: courageBook.accent,
    variant: "crayon",
    imageDesc: courageBook.sections[0].imageDesc,
    text: courageBook.sections[0].text,
    pageNum: 1,
    pageTotal: courageBook.sections.length,
  },
};

export const Cover: Story = {
  args: {
    kind: "cover",
    title: courageBook.title,
    value: courageBook.value,
    accent: courageBook.accent,
    variant: courageBook.styleId,
  },
};

export const PageCrayonDoodle: Story = {
  name: "Page — Crayon Doodle",
  args: {
    kind: "page",
    title: courageBook.title,
    value: courageBook.value,
    accent: courageBook.accent,
    variant: "crayon",
    imageDesc: courageBook.sections[0].imageDesc,
    text: courageBook.sections[0].text,
    pageNum: 1,
    pageTotal: courageBook.sections.length,
  },
};

export const PagePaperCutout: Story = {
  name: "Page — Paper Cut-out",
  args: {
    kind: "page",
    title: kindnessBook.title,
    value: kindnessBook.value,
    accent: kindnessBook.accent,
    variant: "cutout",
    imageDesc: kindnessBook.sections[1].imageDesc,
    text: kindnessBook.sections[1].text,
    pageNum: 2,
    pageTotal: kindnessBook.sections.length,
  },
};

export const PageSoftWatercolor: Story = {
  name: "Page — Soft Watercolor",
  args: {
    kind: "page",
    title: perseveranceBook.title,
    value: perseveranceBook.value,
    accent: perseveranceBook.accent,
    variant: "watercolor",
    imageDesc: perseveranceBook.sections[2].imageDesc,
    text: perseveranceBook.sections[2].text,
    pageNum: 3,
    pageTotal: perseveranceBook.sections.length,
  },
};

export const PageWithoutImageDescription: Story = {
  name: "Page — empty image description (fallback caption)",
  args: {
    kind: "page",
    title: courageBook.title,
    value: courageBook.value,
    accent: courageBook.accent,
    variant: "crayon",
    imageDesc: "",
    text: courageBook.sections[0].text,
    pageNum: 1,
    pageTotal: courageBook.sections.length,
  },
};
