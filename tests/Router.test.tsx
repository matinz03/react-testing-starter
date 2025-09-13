import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { Product } from "../src/entities";
import routes from "../src/routes";
import { db } from "./mocks/db";

let product: Product;

describe("Router", () => {
  beforeAll(() => {
    product = db.product.create();
  });

  afterAll(() => {
    db.product.delete({ where: { id: { equals: product.id } } });
  });

  it.each([
    { route: "/", text: /home/i },
    { route: "/products", text: /products/i },
    { route: "/admin", text: /admin/i },
    { route: "/admin/products", text: /products/i },
    { route: "/admin/products/new", text: /new/i },
  ])("should render $text for route $route", ({ route, text }) => {
    const router = createMemoryRouter(routes, { initialEntries: [route] });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("heading", { name: text })).toBeInTheDocument();
  });
  it("should render not found for invalid route", () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/invalid-route"],
    });
    render(<RouterProvider router={router} />);
    expect(screen.getByText(/not found/i)).toBeInTheDocument();
  });

  it("should render product details for /products/:id", async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: [`/products/${product.id}`],
    });
    render(<RouterProvider router={router} />);
    expect(
      await screen.findByRole("heading", {
        name: new RegExp(product.name, "i"),
      })
    ).toBeInTheDocument();
  });
  it("should render product details for admin/products/:id/edit", async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: [`/admin/products/${product.id}/edit`],
    });
    render(<RouterProvider router={router} />);
    expect(
      await screen.findByRole("heading", {
        name: /edit/i,
      })
    ).toBeInTheDocument();
  });
});
