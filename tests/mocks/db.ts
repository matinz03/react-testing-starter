/* eslint-disable @typescript-eslint/unbound-method */
import { factory, primaryKey } from "@mswjs/data";
import { faker } from "@faker-js/faker";
export const db = factory({
  category: {
    id: primaryKey(faker.number.int),
    name: faker.commerce.department,
  },

  product: {
    id: primaryKey(faker.number.int),
    name: faker.commerce.productName,
    categoryId: faker.number.int,
    price: faker.number.int.bind({ min: 1, max: 100 }),
  },
});
