import * as jestDomMatchers from "@testing-library/jest-dom/matchers";
import "@testing-library/jest-dom";

const { toHaveTextContent: originalToHaveTextContent } = jestDomMatchers;

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

expect.extend({
  toHaveTextContent(
    element: HTMLElement,
    checkWith: string | RegExp,
    options: { normalizeWhitespace: boolean } = { normalizeWhitespace: true }
  ) {
    if (options.normalizeWhitespace !== false && typeof checkWith === "string") {
      return originalToHaveTextContent.call(
        this,
        element,
        normalizeWhitespace(checkWith),
        options
      );
    }
    return originalToHaveTextContent.call(this, element, checkWith, options);
  },
});
