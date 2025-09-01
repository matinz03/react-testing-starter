import { render, screen } from "@testing-library/react";
import ProductDetail from "../../src/components/ProductDetail";
import { products } from "../data";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";
describe("ProductDetails", () => {
  it("should render the product details", async () => {
    render(<ProductDetail productId={1} />);
    expect(await screen.findByText(new RegExp(products[0].name)));
    expect(await screen.findByText(new RegExp(products[0].price.toString())));
  });
  it("should render message if product is not found", async () => {
    server.use(http.get("/products/1", () => HttpResponse.json(null)));
    render(<ProductDetail productId={1} />);
    expect(await screen.findByText(/not found/i)).toBeInTheDocument();
  });
  it("should render an error for invalid productId", async () => {
    render(<ProductDetail productId={0} />);
    expect(await screen.findByText(/invalid /i)).toBeInTheDocument();
  });
});
