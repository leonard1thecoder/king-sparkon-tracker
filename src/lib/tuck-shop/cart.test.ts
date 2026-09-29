import { describe, expect, test } from "vitest";
import type { Product } from "@/lib/types/backend";
import {
  cartDepositTotal,
  cartEmptiesCreditTotal,
  cartEmptiesReturnedCount,
  cartNetTotal,
  cartReturnableUnitCount,
  clampEmptiesReturned,
  lineEmptiesCreditTotal,
  lineNetTotal,
  returnableDeposit,
  type TuckShopCartProductLine,
} from "./cart";

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: 9,
    name: "Beer",
    category: "Alcohol",
    price: 20,
    stockQuantity: 10,
    returnableEnabled: true,
    returnablePrice: 3,
    ...overrides,
  };
}

function line(overrides: Partial<TuckShopCartProductLine> = {}): TuckShopCartProductLine {
  return { kind: "PRODUCT", product: product(), quantity: 4, emptiesReturned: 3, ...overrides };
}

describe("returnable cart math", () => {
  test("deposit snapshot follows the owner-configured price", () => {
    expect(returnableDeposit(product())).toBe(3);
    expect(returnableDeposit(product({ returnableEnabled: false }))).toBe(0);
  });

  test("empties clamp to quantity and require a returnable product", () => {
    expect(clampEmptiesReturned(product(), 4, 3)).toBe(3);
    expect(clampEmptiesReturned(product(), 4, 9)).toBe(4);
    expect(clampEmptiesReturned(product(), 4, -1)).toBe(0);
    expect(clampEmptiesReturned(product({ returnableEnabled: false }), 4, 2)).toBe(0);
  });

  test("line credit and net totals", () => {
    expect(lineEmptiesCreditTotal(line())).toBe(9);
    expect(lineNetTotal(line())).toBe(80 - 9);
  });

  test("cart aggregates returnable units, credit and net payable", () => {
    const cart = [line(), line({ quantity: 1, emptiesReturned: 0 })];
    expect(cartReturnableUnitCount(cart)).toBe(5);
    expect(cartEmptiesReturnedCount(cart)).toBe(3);
    expect(cartDepositTotal(cart)).toBe(15);
    expect(cartEmptiesCreditTotal(cart)).toBe(9);
    expect(cartNetTotal(cart)).toBe(100 - 9);
  });
});
