import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import CategoryList from "../../src/components/CategoryList";
import { Category } from "../../src/entities";
import { AllProviders } from "../AllProviders";
import { db } from "../mocks/db";
import { simulateDelay, simulateError } from "../utils";
describe("CategoryList", () => {
  const categories: Category[] = [];
  beforeAll(() => {
    [1, 2].forEach((i) => {
      const category = db.category.create();
      category.name += i;
      categories.push(category);
    });
  });
  afterAll(() => {
    categories.forEach((category) => {
      db.category.delete({ where: { id: { equals: category.id } } });
    });
  });
  const renderComponent = () => {
    render(<CategoryList />, { wrapper: AllProviders });
  };
  it("should render a list of categories", async () => {
    renderComponent();
    await waitForElementToBeRemoved(screen.queryByText(/loading/i));
    categories.forEach((c) =>
      expect(screen.getByText(c.name)).toBeInTheDocument()
    );
  });
  it("should render a loading message when fetching categories", () => {
    simulateDelay("/categories");
    renderComponent();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
  it("should render an error when fetching categories fail ", () => {
    simulateError("/categories");
    renderComponent();

    expect(screen.findByText(/error/i));
  });
});
