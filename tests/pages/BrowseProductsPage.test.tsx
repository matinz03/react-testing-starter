import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";

import { Theme } from "@radix-ui/themes";
import BrowseProducts from "../../src/pages/BrowseProductsPage";
import { Category, Product } from "../../src/entities";
import { db } from "../mocks/db";
import userEvent from "@testing-library/user-event";
import { CartProvider } from "../../src/providers/CartProvider";
import { faker } from "@faker-js/faker";
import { simulateDelay, simulateError } from "../utils";
describe("BrowseProductsPage", () => {
  const categories: Category[] = [];
  const products: Product[] = [];
  beforeAll(() => {
    [1, 2].forEach((index) => {
      categories.push(
        db.category.create({
          name: faker.commerce.department.toString() + index,
        })
      );
      products.push(db.product.create());
    });
  });
  afterAll(() => {
    const categoryIds: number[] = categories.map((category) => category.id);
    const productIds: number[] = products.map((product) => product.id);
    db.category.deleteMany({ where: { id: { in: categoryIds } } });
    db.product.deleteMany({ where: { id: { in: productIds } } });
  });
  const renderComponent = () => {
    render(
      <CartProvider>
        <Theme>
          <BrowseProducts />
        </Theme>
      </CartProvider>
    );

    const getSkeleton = (option: string) =>
      screen.queryByRole("progressbar", {
        name: new RegExp(option, "i"),
      });
    const findSkeleton = (option: string) =>
      screen.findByRole("progressbar", {
        name: new RegExp(option, "i"),
      });
    const getCategoriesCombobox = () => screen.queryByRole("combobox");

    return { getSkeleton, findSkeleton, getCategoriesCombobox };
  };

  it("should render the skeleton when categories is being fetched", async () => {
    simulateDelay("/categories");
    renderComponent();
    expect(
      await screen.findByRole("progressbar", { name: /categories/i })
    ).toBeInTheDocument();
  });
  it("should hide the loading skeleton after categories are fetched", async () => {
    const { getSkeleton } = renderComponent();
    await waitForElementToBeRemoved(() => getSkeleton("categories"));
  });
  it("should render skeleton when products is being fetched", async () => {
    simulateDelay("/products");
    const { findSkeleton } = renderComponent();
    expect(await findSkeleton("products")).toBeInTheDocument();
  });
  it("should hide the loading skeleton after products are fetched", async () => {
    const { getSkeleton } = renderComponent();
    await waitForElementToBeRemoved(() => getSkeleton("products"));
  });
  it("should render an error if categories cannot be fetched", async () => {
    simulateError("/categories");
    const { getSkeleton, getCategoriesCombobox } = renderComponent();
    await waitForElementToBeRemoved(() => getSkeleton("categories"));
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    expect(getCategoriesCombobox()).not.toBeInTheDocument();
  });
  it("should render an error if products cannot be fetched", async () => {
    simulateError("/products");
    renderComponent();
    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });
  it("should render categories", async () => {
    const { getSkeleton, getCategoriesCombobox } = renderComponent();
    await waitForElementToBeRemoved(() => getSkeleton("categories"));
    const combobox = getCategoriesCombobox();
    expect(combobox).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(combobox!);
    expect(screen.getByRole("option", { name: /all/i })).toBeInTheDocument();
    categories.forEach((c) => {
      expect(screen.getByRole("option", { name: c.name })).toBeInTheDocument();
    });
  });
  it("should render products", async () => {
    const { getSkeleton } = renderComponent();
    await waitForElementToBeRemoved(() => getSkeleton("products"));
    products.forEach((c) => {
      expect(screen.queryByText(c.name)).toBeInTheDocument();
    });
  });
});
