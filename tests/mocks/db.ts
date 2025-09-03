/* eslint-disable @typescript-eslint/unbound-method */
import { factory, manyOf, oneOf, primaryKey } from "@mswjs/data";
import { faker } from "@faker-js/faker";
export const db = factory({
  category: {
    id: primaryKey(faker.number.int),
    name: faker.commerce.department,
    products: manyOf("product"),
  },

  product: {
    id: primaryKey(faker.number.int),
    name: faker.commerce.productName,
    categoryId: faker.number.int,
    category: oneOf("category"),
    price: faker.number.int.bind({ min: 1, max: 100 }),
  },
});
export const getProductsByCategory = (categoryId: number) => {
  return db.product.findMany({ where: { categoryId: { equals: categoryId } } });
};
