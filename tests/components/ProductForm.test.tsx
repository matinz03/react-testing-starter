/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductForm from "../../src/components/ProductForm";
import { Category, Product } from "../../src/entities";
import { AllProviders } from "../AllProviders";
import { db } from "../mocks/db";
describe("ProductForm", () => {
  let category: Category;
  beforeAll(() => {
    category = db.category.create();
  });
  afterAll(() => {
    db.category.delete({ where: { id: { equals: category.id } } });
  });
  it("should render form fields", async () => {
    const { loaded } = renderComponent();
    await loaded();
  });
  it("should render product details when used for editing a product", async () => {
    const product: Product = db.product.create({ categoryId: category.id });
    const { loaded } = renderComponent(product);
    const categoryName = db.category.findFirst({
      where: { id: { equals: category.id } },
    })?.name;
    const { inputName, inputPrice, combo } = await loaded();
    expect(inputName).toHaveValue(product.name);
    expect(inputPrice).toHaveValue(product.price.toString());
    expect(combo).toHaveTextContent(categoryName!);
    expect(inputName).toHaveFocus();
  });
  it.each([
    {
      scenario: "is missing",
      errorMessage: /required/i,
    },
    {
      scenario: "is longer than 255",
      name: "a".repeat(256),
      errorMessage: /255/i,
    },
  ])(
    "should render an error if name $scenario",
    async ({ errorMessage, name }) => {
      const { loaded, expectErrorToBeInTheDocument } = renderComponent();
      const { fill, validData } = await loaded();
      await fill({ ...validData, name });
      expectErrorToBeInTheDocument(errorMessage);
    }
  );
  it.each([
    { scenario: "is missing", errorMessage: /required/i, name: "a".repeat(5) },
    {
      scenario: "is less than 1",
      errorMessage: /greater/i,
      price: "-2",
    },
    {
      scenario: "is more than 1000",
      errorMessage: /less/i,
      price: "1002",
    },
    {
      scenario: "is a character",
      errorMessage: /required/i,
      price: "a",
    },
  ])(
    "should render an error if price $scenario",
    async ({ price, errorMessage }) => {
      const { loaded, expectErrorToBeInTheDocument } = renderComponent();
      const { fill, validData } = await loaded();
      await fill({ ...validData, price });
      expectErrorToBeInTheDocument(errorMessage);
    }
  );
});

const renderComponent = (product?: Product) => {
  render(<ProductForm onSubmit={vi.fn()} product={product} />, {
    wrapper: AllProviders,
  });
  type FormData = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [K in keyof Product]: any;
  };
  const validData: FormData = {
    id: 1,
    name: "a",
    price: "1",
    categoryId: 1,
  };

  const getName = () => {
    return screen.getByPlaceholderText(/name/i);
  };
  const getPrice = () => {
    return screen.getByPlaceholderText(/price/i);
  };
  const getCombo = () => {
    return screen.getByRole("combobox", { name: /category/i });
  };
  const getSubmit = () => {
    return screen.getByRole("button");
  };

  const expectErrorToBeInTheDocument = (errorMessage: RegExp) => {
    const error = screen.getByRole("alert");
    expect(error).toBeInTheDocument();
    expect(error).toHaveTextContent(errorMessage);
  };
  const loaded = async () => {
    await waitForElementToBeRemoved(() => screen.getByText(/loading/i));
    const inputName = getName();
    const inputPrice = getPrice();
    const combo = getCombo();
    const submit = getSubmit();
    const fill = async (product: FormData) => {
      const user = userEvent.setup();
      if (product.name !== undefined) await user.type(inputName, product.name);
      if (product.price !== undefined)
        await user.type(inputPrice, product.price);
      await user.tab();
      await user.click(combo);

      const options = screen.getAllByRole("option");

      await user.click(options[0]);

      await user.click(submit);
    };
    return { inputName, inputPrice, combo, submit, fill, validData };
  };
  return { loaded, expectErrorToBeInTheDocument };
};
