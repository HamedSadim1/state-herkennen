import { describe, it, expect } from "vitest";
import { escapeCsvCell, parseCsvToProducts } from "./csv";

describe("escapeCsvCell", () => {
  it("prefixes formula-starting cells with an apostrophe", () => {
    expect(escapeCsvCell("=SUM(A1)")).toBe("'=SUM(A1)");
    expect(escapeCsvCell("+command")).toBe("'+command");
  });

  it("keeps the apostrophe inside the quotes for quoted cells", () => {
    // A comma forces quoting; the apostrophe must sit inside the quotes so
    // the field stays a single well-formed CSV cell.
    expect(escapeCsvCell("=foo,bar")).toBe('"\'=foo,bar"');
  });

  it("leaves normal values untouched", () => {
    expect(escapeCsvCell("iPhone 12")).toBe("iPhone 12");
    expect(escapeCsvCell(699)).toBe("699");
  });
});

describe("parseCsvToProducts", () => {
  it("skips a standard header and parses the data rows", () => {
    const csv = "id,name,category,price,quantity\n1,AirPods,Audio,249,30\n";

    const { products, warnings } = parseCsvToProducts(csv);

    expect(products).toHaveLength(1);
    expect(products[0]).toMatchObject({
      name: "AirPods",
      category: "Audio",
      price: 249,
      quantity: 30,
    });
    expect(warnings).toHaveLength(0);
  });

  it("skips a foreign header when at least two columns are recognized", () => {
    const csv = "Product Name,Category,Price,Quantity\nMacBook,Laptop,999,6\n";

    const { products } = parseCsvToProducts(csv);

    expect(products).toHaveLength(1);
    expect(products[0].name).toBe("MacBook");
  });

  it("treats a headerless CSV as pure data", () => {
    const csv = "AirPods,Audio,249,30\n";

    const { products } = parseCsvToProducts(csv);

    expect(products).toHaveLength(1);
    expect(products[0].name).toBe("AirPods");
  });

  it("warns and falls back to Accessories for an unknown category", () => {
    const csv = "name,category,price,quantity\nGadget,Futuristic,5,1\n";

    const { products, warnings } = parseCsvToProducts(csv);

    expect(products[0].category).toBe("Accessories");
    expect(warnings).toHaveLength(1);
  });

  it("throws on empty input", () => {
    expect(() => parseCsvToProducts("")).toThrow("empty");
  });

  it("throws when a row is missing its name", () => {
    const csv = "name,category,price,quantity\n,Audio,5,1\n";

    expect(() => parseCsvToProducts(csv)).toThrow(/name is missing/);
  });

  it("throws when a row has an invalid price", () => {
    const csv = "name,category,price,quantity\nAirPods,Audio,abc,1\n";

    expect(() => parseCsvToProducts(csv)).toThrow(/price must be a number/);
  });

  it("regenerates ids so duplicate csv ids can never collide", () => {
    const csv =
      "id,name,category,price,quantity\nx,A,Audio,1,1\nx,B,Audio,2,2\n";

    const { products } = parseCsvToProducts(csv);

    expect(products[0].id).not.toBe(products[1].id);
  });

  it("rejects files over the row limit", () => {
    const header = "name,category,price,quantity\n";
    const rows = Array.from({ length: 10001 }, (_, i) => `P${i},Audio,1,1`);
    const csv = header + rows.join("\n");

    expect(() => parseCsvToProducts(csv)).toThrow(/import limit/);
  });
});
