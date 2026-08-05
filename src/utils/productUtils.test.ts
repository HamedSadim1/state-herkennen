import { describe, it, expect } from "vitest";
import { Product } from "../types/product";
import {
  DEFAULT_FILTERS,
  filterProducts,
  getActiveStockFilter,
  getNextSortConfig,
  hasActiveFilters,
  hasAnyStockFilter,
  sortProducts,
  validateProductInput,
} from "./productUtils";

const product = (overrides: Partial<Product> = {}): Product => ({
  id: "1",
  name: "Test",
  price: 10,
  quantity: 5,
  category: "Audio",
  ...overrides,
});

describe("validateProductInput", () => {
  it("rejects an empty name", () => {
    const errors = validateProductInput({
      name: "  ",
      price: "10",
      quantity: "1",
    });
    expect(errors.name).toBeDefined();
  });

  it("rejects an empty price instead of silently accepting 0", () => {
    // Number("") === 0, so this must be caught explicitly.
    const errors = validateProductInput({
      name: "A",
      price: "",
      quantity: "1",
    });
    expect(errors.price).toBeDefined();
  });

  it("rejects a negative price", () => {
    const errors = validateProductInput({
      name: "A",
      price: "-5",
      quantity: "1",
    });
    expect(errors.price).toBeDefined();
  });

  it("rejects an empty quantity instead of silently storing 0", () => {
    // Regression for the critical bug where Number("") === 0 slipped through.
    const errors = validateProductInput({
      name: "A",
      price: "10",
      quantity: "",
    });
    expect(errors.quantity).toBeDefined();
  });

  it("rejects decimal quantities", () => {
    const errors = validateProductInput({
      name: "A",
      price: "10",
      quantity: "5.5",
    });
    expect(errors.quantity).toBeDefined();
  });

  it("rejects hex and scientific notation quantities", () => {
    expect(
      validateProductInput({ name: "A", price: "10", quantity: "0x10" })
        .quantity
    ).toBeDefined();
    expect(
      validateProductInput({ name: "A", price: "10", quantity: "1e2" }).quantity
    ).toBeDefined();
  });

  it("returns no errors for valid input", () => {
    const errors = validateProductInput({
      name: "A",
      price: "10",
      quantity: "3",
    });
    expect(Object.keys(errors)).toHaveLength(0);
  });
});

describe("filterProducts", () => {
  const products = [
    product({ id: "a", name: "Apple", category: "Audio", quantity: 10 }),
    product({ id: "b", name: "Banana", category: "Laptop", quantity: 2 }),
    product({ id: "c", name: "Cherry", category: "Audio", quantity: 0 }),
  ];

  it("returns everything when no filters are active", () => {
    expect(filterProducts(products, DEFAULT_FILTERS)).toHaveLength(3);
  });

  it("filters case-insensitively by search term", () => {
    const config = { ...DEFAULT_FILTERS, searchTerm: "AN" };
    expect(filterProducts(products, config).map((p) => p.name)).toEqual([
      "Banana",
    ]);
  });

  it("filters by category", () => {
    const config = { ...DEFAULT_FILTERS, category: "Audio" as const };
    expect(filterProducts(products, config).map((p) => p.name)).toEqual([
      "Apple",
      "Cherry",
    ]);
  });

  it("matches dashboard semantics: low stock and in stock are exclusive", () => {
    const inStock = filterProducts(products, {
      ...DEFAULT_FILTERS,
      showInStockOnly: true,
    });
    const lowStock = filterProducts(products, {
      ...DEFAULT_FILTERS,
      showLowStockOnly: true,
    });
    const outOfStock = filterProducts(products, {
      ...DEFAULT_FILTERS,
      showOutOfStockOnly: true,
    });

    expect(inStock.map((p) => p.id)).toEqual(["a"]);
    expect(lowStock.map((p) => p.id)).toEqual(["b"]);
    expect(outOfStock.map((p) => p.id)).toEqual(["c"]);
  });
});

describe("sortProducts", () => {
  const products = [
    product({ id: "a", name: "Banana" }),
    product({ id: "b", name: "Apple" }),
    product({ id: "c", name: "Cherry" }),
  ];

  it("sorts by name ascending and descending", () => {
    expect(
      sortProducts(products, { field: "name", direction: "asc" }).map(
        (p) => p.id
      )
    ).toEqual(["b", "a", "c"]);
    expect(
      sortProducts(products, { field: "name", direction: "desc" }).map(
        (p) => p.id
      )
    ).toEqual(["c", "a", "b"]);
  });
});

describe("filter helpers", () => {
  it("hasActiveFilters detects search, category and stock filters", () => {
    expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, searchTerm: "x" })).toBe(
      true
    );
    expect(
      hasActiveFilters({ ...DEFAULT_FILTERS, category: "Audio" as const })
    ).toBe(true);
    expect(
      hasActiveFilters({ ...DEFAULT_FILTERS, showLowStockOnly: true })
    ).toBe(true);
  });

  it("hasAnyStockFilter reflects the three stock flags", () => {
    expect(hasAnyStockFilter(DEFAULT_FILTERS)).toBe(false);
    expect(
      hasAnyStockFilter({ ...DEFAULT_FILTERS, showInStockOnly: true })
    ).toBe(true);
  });

  it("getActiveStockFilter matches the dashboard cards", () => {
    expect(getActiveStockFilter(DEFAULT_FILTERS)).toBe("all");
    expect(
      getActiveStockFilter({ ...DEFAULT_FILTERS, showInStockOnly: true })
    ).toBe("inStock");
    expect(
      getActiveStockFilter({ ...DEFAULT_FILTERS, showLowStockOnly: true })
    ).toBe("lowStock");
    expect(
      getActiveStockFilter({ ...DEFAULT_FILTERS, showOutOfStockOnly: true })
    ).toBe("outOfStock");
  });
});

describe("getNextSortConfig", () => {
  it("toggles direction on the active field", () => {
    expect(
      getNextSortConfig({ field: "name", direction: "asc" }, "name")
    ).toEqual({
      field: "name",
      direction: "desc",
    });
  });

  it("starts ascending when switching to a new field", () => {
    expect(
      getNextSortConfig({ field: "name", direction: "desc" }, "price")
    ).toEqual({
      field: "price",
      direction: "asc",
    });
  });
});
