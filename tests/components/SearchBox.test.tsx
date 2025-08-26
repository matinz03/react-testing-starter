import { render, screen } from "@testing-library/react";
import SearchBox from "../../src/components/SearchBox";
import userEvent from "@testing-library/user-event";
describe("SearchBox", () => {
  const renderSearchBox = () => {
    const onChange = vi.fn();
    render(<SearchBox onChange={onChange} />);
    const input = screen.getByPlaceholderText(/search/i);
    const user = userEvent.setup();
    return {
      input,
      user,
      onChange,
    };
  };
  it("should check the existence of searchbox", () => {
    const { input } = renderSearchBox();
    expect(input).toBeInTheDocument();
  });
  it("should make sure input change is handled with content", async () => {
    const text = "cheese";
    const { input, user, onChange } = renderSearchBox();
    await user.type(input, text + "{enter}");
    expect(onChange).toHaveBeenCalledWith(text);
  });
  it("should make sure change is not called when without content", async () => {
    const { input, user, onChange } = renderSearchBox();
    await user.type(input, "{enter}");
    expect(onChange).not.toHaveBeenCalled();
  });
});
