import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import ProductList from "../../src/components/ProductList";
import { server } from "../mocks/server";
import { http, HttpResponse, delay } from "msw";
import { db } from "../mocks/db";
describe("ProductList", () => {
  const productIds: number[] = [];
  beforeAll(() => {
    [1, 2, 3].forEach(() => {
      const product = db.product.create();
      productIds.push(product.id);
    });
  });
  afterAll(() => {
    db.product.deleteMany({ where: { id: { in: productIds } } });
  });
  it("should render the list of products", async () => {
    render(<ProductList />);
    const items = await screen.findAllByRole("listitem");
    expect(items.length).toBeGreaterThan(0);
  });
  it("should render 'No products available.' when there are no products", async () => {
    server.use(http.get("/products", () => HttpResponse.json([])));
    render(<ProductList />);
    const message = await screen.findByText(/no products /i);
    expect(message).toBeInTheDocument();
  });
  it("should render a message wheen there is an error", async () => {
    server.use(http.get("/products", () => HttpResponse.error()));
    render(<ProductList />);
    const message = await screen.findByText(/error/i);
    expect(message).toBeInTheDocument();
  });
  it("should render a loading indicator while fetching data", async () => {
    server.use(
      http.get("/products", async () => {
        await delay();
        HttpResponse.json();
      })
    );
    render(<ProductList />);
    const message = await screen.findByText(/loading/i);
    expect(message).toBeInTheDocument();
  });
  it("should remove the loading when data is fetched", async () => {
    render(<ProductList />);
    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
  });
  it("should remove the loading if data fetching fails  ", async () => {
    render(<ProductList />);
    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
  });
});
