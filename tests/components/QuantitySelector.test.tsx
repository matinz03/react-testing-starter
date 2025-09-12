import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuantitySelector from "../../src/components/QuantitySelector";
import { Product } from "../../src/entities";
import { CartProvider } from "../../src/providers/CartProvider";

describe("Quantity Selector", () => {
  const renderComponent = () => {
    const product: Product = { id: 1, name: "Milk", price: 1, categoryId: 1 };
    render(
      <CartProvider>
        <QuantitySelector product={product} />
      </CartProvider>
    );
    const user = userEvent.setup();
    const QuantityControls = () => ({
      increaseItem: screen.getByRole("button", { name: /\+/i }),
      decreaseItem: screen.getByRole("button", { name: /-/i }),
      itemQuantity: screen.getByRole("status"),
    });
    return {
      AddToCart: () => screen.getByRole("button", { name: /add to cart/i }),
      QuantityControls,
      user,
    };
  };

  it("should render add to cart button", () => {
    const { AddToCart } = renderComponent();
    expect(AddToCart()).toBeInTheDocument();
  });
  it("should render plus and minus buttons as well as current quantity", async () => {
    const { user, QuantityControls, AddToCart } = renderComponent();
    await user.click(AddToCart());
    const { decreaseItem, increaseItem, itemQuantity } = QuantityControls();
    expect(decreaseItem).toBeInTheDocument();
    expect(increaseItem).toBeInTheDocument();
    expect(itemQuantity).toHaveTextContent("1");
  });
  it("should render an increased number of quantities", async () => {
    const { user, QuantityControls, AddToCart } = renderComponent();
    await user.click(AddToCart());
    const { increaseItem, itemQuantity } = QuantityControls();
    await user.click(increaseItem);
    expect(itemQuantity).toHaveTextContent("2");
  });
  it("should render add to cart after quantity has reached 0", async () => {
    const { user, QuantityControls, AddToCart } = renderComponent();

    await user.click(AddToCart());

    const { increaseItem, decreaseItem, itemQuantity } = QuantityControls();
    await user.click(decreaseItem);
    expect(decreaseItem).not.toBeInTheDocument();
    expect(increaseItem).not.toBeInTheDocument();
    expect(itemQuantity).not.toBeInTheDocument();
    expect(AddToCart()).toBeInTheDocument();
  });
});
