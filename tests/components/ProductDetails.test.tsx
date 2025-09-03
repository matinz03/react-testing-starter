import { render, screen } from "@testing-library/react";
import ProductDetail from "../../src/components/ProductDetail";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";
import { db } from "../mocks/db";
import { AllProviders } from "../AllProviders";
describe("ProductDetails", () => {
  let productId: number;
  beforeAll(() => {
    const product = db.product.create();
    productId = product.id;
  });
  afterAll(() => {
    db.product.delete({ where: { id: { equals: productId } } });
  });
  it("should render the product details", async () => {
    render(<ProductDetail productId={productId} />, { wrapper: AllProviders });
    const product = db.product.findFirst({
      where: { id: { equals: productId } },
    })!;

    expect(await screen.findByText(new RegExp(product.name)));
    expect(await screen.findByText(new RegExp(product.price.toString())));
  });
  it("should render message if product is not found", async () => {
    server.use(http.get("/products/1", () => HttpResponse.json(null)));
    render(<ProductDetail productId={1} />, { wrapper: AllProviders });
    expect(await screen.findByText(/not found/i)).toBeInTheDocument();
  });
  it("should render an error for invalid productId", async () => {
    render(<ProductDetail productId={0} />, { wrapper: AllProviders });
    expect(await screen.findByText(/invalid /i)).toBeInTheDocument();
  });
  it("should render an error message when there is an error", async () => {
    server.use(http.get("/products/1", () => HttpResponse.error()));
    render(<ProductDetail productId={1} />, { wrapper: AllProviders });
    expect(await screen.findByText(/error/i));
  });
});
