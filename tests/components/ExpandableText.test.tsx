import { render, screen } from "@testing-library/react";
import ExpandableText from "../../src/components/ExpandableText";
import userEvent from "@testing-library/user-event";
describe("ExpandableText", () => {
  const limit = 255;
  const shortText = "a".repeat(5);
  const longText = "a".repeat(limit + 30);
  const truncatedText = "a".repeat(255) + "...";
  it("should render an article if the text is short", () => {
    render(<ExpandableText text={shortText} />);
    const article = screen.getByRole("article");
    const button = screen.queryByRole("button");
    expect(article.textContent.length).toBeLessThan(255);
    expect(button).not.toBeInTheDocument();
  });
  it("should click the more button to expand the text", async () => {
    render(<ExpandableText text={longText} />);
    const article = screen.getByText(truncatedText);
    const showMoreButton = screen.getByRole("button", { name: /more/i });
    expect(article).toBeInTheDocument();
    await userEvent.click(showMoreButton);
    expect(longText).toBeInTheDocument;
  });
  it("should retract an article after expansion", async () => {
    render(<ExpandableText text={longText} />);
    const showMoreButton = screen.getByRole("button", { name: /more/i });
    await userEvent.click(showMoreButton);
    const showLessButton = screen.getByRole("button");
    expect(showLessButton).toHaveTextContent(/less/i);
    await userEvent.click(showLessButton);
    expect(screen.getByText(truncatedText)).toBeInTheDocument();
  });
});
