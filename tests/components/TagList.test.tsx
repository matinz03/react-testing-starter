import { render, screen } from "@testing-library/react";
import TagList from "../../src/components/TagList";
describe("TagList", () => {
  it("should render list items", async () => {
    render(<TagList />);
    const listItems = await screen.findAllByRole("listitem");
    expect(listItems.length).toBeGreaterThan(0);
  });
});
