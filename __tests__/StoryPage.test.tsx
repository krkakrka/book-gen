import { render, screen } from "@testing-library/react";
import StoryPage from "@/components/StoryPage";

describe("StoryPage component", () => {
  it("renders a cover with title and value chip, no narrator band", () => {
    render(
      <StoryPage
        kind="cover"
        title="Pip and the Whispering Forest"
        value="Courage"
        accent="#2E6BFF"
        variant="crayon"
      />
    );
    expect(screen.getByTestId("story-page")).toBeInTheDocument();
    expect(screen.getByTestId("story-page-title")).toHaveTextContent("Pip and the Whispering Forest");
    expect(screen.getByTestId("story-page-value")).toHaveTextContent("Courage");
    expect(screen.queryByTestId("story-page-text")).not.toBeInTheDocument();
  });

  it("renders a page with caption, narrator text and page label", () => {
    render(
      <StoryPage
        kind="page"
        imageDesc="A small orange fox peeking out from behind a giant oak tree"
        text="Pip the fox loved his cozy corner of the forest."
        variant="crayon"
        pageNum={1}
        pageTotal={5}
      />
    );
    expect(screen.getByTestId("story-page-caption")).toHaveTextContent(
      "✎  A small orange fox peeking out from behind a giant oak tree"
    );
    expect(screen.getByTestId("story-page-text")).toHaveTextContent(
      "Pip the fox loved his cozy corner of the forest."
    );
    expect(screen.getByTestId("story-page-label")).toHaveTextContent("Page 1");
    expect(screen.queryByTestId("story-page-title")).not.toBeInTheDocument();
  });

  it("falls back to placeholder caption when imageDesc is empty", () => {
    render(<StoryPage kind="page" text="Some narration." variant="cutout" pageNum={2} />);
    expect(screen.getByTestId("story-page-caption")).toHaveTextContent("✎  illustration goes here");
  });
});
