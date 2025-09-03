import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";

import { Theme } from "@radix-ui/themes";
import BrowseProducts from "../../src/pages/BrowseProductsPage";
import { Category, Product } from "../../src/entities";
import { db, getProductsByCategory } from "../mocks/db";
import userEvent from "@testing-library/user-event";
import { CartProvider } from "../../src/providers/CartProvider";
import { simulateDelay, simulateError } from "../utils";
describe("BrowseProductsPage", () => {
  const categories: Category[] = [];
  const products: Product[] = [];
  beforeAll(() => {
    [1, 2].forEach(() => {
      const category = db.category.create();
      categories.push(category);
      [1, 2].forEach(() => {
        products.push(db.product.create({ categoryId: category.id }));
      });
    });
  });
  afterAll(() => {
    const categoryIds: number[] = categories.map((category) => category.id);
    const productIds: number[] = products.map((product) => product.id);
    db.category.deleteMany({ where: { id: { in: categoryIds } } });
    db.product.deleteMany({ where: { id: { in: productIds } } });
  });

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
  it("should filter products by category", async () => {
    const { selectCategory, expectProductsToBeInTheDocument } =
      renderComponent();
    const selectedCategory = categories[0];
    await selectCategory(selectedCategory.name);
    const products = getProductsByCategory(selectedCategory.id);
    expectProductsToBeInTheDocument(products);
  });
  it("should render all when All is selected", async () => {
    const { selectCategory, expectProductsToBeInTheDocument } =
      renderComponent();
    await selectCategory(/all/i);
    expectProductsToBeInTheDocument(products);
  });
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

  const selectCategory = async (name: RegExp | string) => {
    await waitForElementToBeRemoved(() => getSkeleton("categories"));
    const combobox = getCategoriesCombobox();
    await userEvent.click(combobox!);

    //Act
    const option = screen.getByRole("option", { name });
    await userEvent.click(option);
  };
  const expectProductsToBeInTheDocument = (products: Product[]) => {
    const rows = screen.getAllByRole("row");
    const dataRows = rows.splice(1);
    expect(dataRows).toHaveLength(products.length);
    products.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    });
  };

  return {
    getSkeleton,
    findSkeleton,
    getCategoriesCombobox,
    selectCategory,
    expectProductsToBeInTheDocument,
  };
};
