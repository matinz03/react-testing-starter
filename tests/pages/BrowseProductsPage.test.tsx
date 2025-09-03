import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { server } from "../mocks/server";
import { delay, http, HttpResponse } from "msw";
import { Theme } from "@radix-ui/themes";
import BrowseProducts from "../../src/pages/BrowseProductsPage";
import { Category, Product } from "../../src/entities";
import { db } from "../mocks/db";
import userEvent from "@testing-library/user-event";
import { CartProvider } from "../../src/providers/CartProvider";
import { faker } from "@faker-js/faker";
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
    return render(
      <CartProvider>
        <Theme>
          <BrowseProducts />
        </Theme>
      </CartProvider>
    );
  };
  it("should render the skeleton when categories is being fetched", async () => {
    server.use(
      http.get("/categories", async () => {
        await delay(500);
        return HttpResponse.json([]);
      })
    );
    renderComponent();
    expect(
      await screen.findByRole("progressbar", { name: /categories/i })
    ).toBeInTheDocument();
  });
  it("should hide the loading skeleton after categories are fetched", async () => {
    renderComponent();
    await waitForElementToBeRemoved(() =>
      screen.queryByRole("progressbar", { name: /categories/i })
    );
  });
  it("should render skeleton when products is being fetched", async () => {
    server.use(
      http.get("/products", async () => {
        await delay();
        return HttpResponse.json([]);
      })
    );
    renderComponent();
    expect(
      await screen.findByRole("progressbar", { name: /products/i })
    ).toBeInTheDocument();
  });
  it("should hide the loading skeleton after products are fetched", async () => {
    renderComponent();
    await waitForElementToBeRemoved(() =>
      screen.queryByRole("progressbar", { name: /products/i })
    );
  });
  it("should render an error if categories cannot be fetched", async () => {
    server.use(http.get("/categories", () => HttpResponse.error()));
    renderComponent();
    await waitForElementToBeRemoved(() =>
      screen.getByRole("progressbar", { name: /categories/i })
    );
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { name: /category/i })
    ).not.toBeInTheDocument();
  });
  it("should render an error if products cannot be fetched", async () => {
    server.use(http.get("/products", () => HttpResponse.error()));
    renderComponent();
    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });
  it("should render categories", async () => {
    renderComponent();
    const combobox = await screen.findByRole("combobox");
    expect(combobox).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(combobox);
    expect(screen.getByRole("option", { name: /all/i })).toBeInTheDocument();
    categories.forEach((c) => {
      expect(screen.getByRole("option", { name: c.name })).toBeInTheDocument();
    });
  });
  it("should render products", async () => {
    renderComponent();
    await waitForElementToBeRemoved(() =>
      screen.queryByRole("progressbar", { name: /products/i })
    );
    products.forEach((c) => {
      expect(screen.queryByText(c.name)).toBeInTheDocument();
    });
  });
});
