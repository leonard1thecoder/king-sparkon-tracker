import { describe, expect, test } from "vitest";
import { clampLineEmpties, lineCredit, lineDeposit, lineNet, type ProductCartLine } from "./cart-context";

function line(overrides: Partial<ProductCartLine> = {}): ProductCartLine {
  return {
    productId: 9,
    name: "Beer",
    price: 20,
    quantity: 4,
    returnableEnabled: true,
    returnablePrice: 3,
    emptiesReturned: 3,
    ...overrides,
  };
}

describe("mobile returnable cart math", () => {
  test("deposit follows the owner-configured price", () => {
    expect(lineDeposit(line())).toBe(3);
    expect(lineDeposit(line({ returnableEnabled: false }))).toBe(0);
  });

  test("empties clamp to quantity and require a returnable product", () => {
    expect(clampLineEmpties(line(), 3)).toBe(3);
    expect(clampLineEmpties(line(), 9)).toBe(4);
    expect(clampLineEmpties(line({ returnableEnabled: false }), 2)).toBe(0);
  });

  test("credit and net totals", () => {
    expect(lineCredit(line())).toBe(9);
    expect(lineNet(line())).toBe(80 - 9);
  });
});
