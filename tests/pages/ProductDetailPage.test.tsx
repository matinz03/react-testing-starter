import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { Product } from "../../src/entities";
import routes from "../../src/routes";
import { db } from "../mocks/db";
describe("ProductDetailPage", () => {
  let product: Product;
  beforeAll(() => (product = db.product.create()));
  afterAll(() => db.product.delete({ where: { id: { equals: product.id } } }));
  it("should render loading when fetching data", () => {
    const router = createMemoryRouter(routes, {
      initialEntries: [`/products/${product.id}`],
    });
    render(<RouterProvider router={router} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
  it("should render product ", async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: [`/products/${product.id}`],
    });
    render(<RouterProvider router={router} />);
    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
    expect(
      screen.getByRole("heading", {
        name: product.name,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(product.price.toString(), "i"))
    ).toBeInTheDocument();
  });
});
