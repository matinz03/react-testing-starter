import { render, screen } from "@testing-library/react";
import OrderStatusSelector from "../../src/components/OrderStatusSelector";
import { Theme } from "@radix-ui/themes";
import userEvent from "@testing-library/user-event";
describe("OrderStatusSelector", () => {
  const onChange = vi.fn();
  const renderComponent = () => {
    render(
      <Theme>
        <OrderStatusSelector onChange={onChange} />
      </Theme>
    );
    const button = screen.getByRole("combobox");

    const user = userEvent.setup();

    return {
      button,
      user,
      getOptions: () => screen.findAllByRole("option"),
      getOption: (label: RegExp) =>
        screen.findByRole("option", { name: label }),
      onChange,
    };
  };

  it("it should render new as the default value", () => {
    const { button } = renderComponent();

    expect(button).toHaveTextContent(/new/i);
  });
  it("it should render list of values", async () => {
    const { button, user, getOptions } = renderComponent();
    await user.click(button);
    const options = await getOptions();
    const label = options.map((item) => item.textContent);
    expect(label).toEqual(["New", "Processed", "Fulfilled"]);
  });
  it.each([
    { label: /processed/i, value: "processed" },
    { label: /fulfilled/i, value: "fulfilled" },
  ])(
    "it should choose $value when clicked on $label",
    async ({ label, value }) => {
      const { button, user, onChange, getOption } = renderComponent();
      await user.click(button);
      const option = await getOption(label);
      await user.click(option);
      expect(onChange).toHaveBeenCalledWith(value);
    }
  );
  it("should make sure new is chosen after rendering the list", async () => {
    const { user, button, onChange, getOption } = renderComponent();
    await user.click(button);
    const processedOption = await getOption(/processed/i);
    await user.click(processedOption);
    await user.click(button);
    const newOption = await getOption(/new/i);
    await user.click(newOption);
    expect(onChange).toHaveBeenCalledWith("new");
  });
});
