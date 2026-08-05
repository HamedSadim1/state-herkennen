import { describe, it, expect } from "vitest";
import { pluralize } from "./formatters";

describe("pluralize", () => {
  it("returns the singular for 1 and the plural otherwise", () => {
    expect(pluralize(1, "product")).toBe("product");
    expect(pluralize(2, "product")).toBe("products");
    expect(pluralize(0, "product")).toBe("products");
  });

  it("accepts an explicit plural form", () => {
    expect(pluralize(1, "box", "boxes")).toBe("box");
    expect(pluralize(2, "box", "boxes")).toBe("boxes");
  });
});
