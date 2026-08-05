import { Product, Category } from "../types/product";
import { generateId } from "./formatters";

const CSV_HEADERS = ["id", "name", "category", "price", "quantity"] as const;

// Parsing runs synchronously on the main thread, so cap the row count to keep
// the UI responsive (and the resulting DOM renderable) on very large files.
const MAX_CSV_ROWS = 10000;

const escapeCsvCell = (value: string | number): string => {
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

export const exportProductsToCsv = (products: Product[]): void => {
  const rows = products.map((product) => [
    product.id,
    product.name,
    product.category,
    product.price,
    product.quantity,
  ]);

  const csv = [CSV_HEADERS, ...rows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "products-inventory.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Minimal CSV row parser that respects double-quoted cells (handles commas
// and escaped quotes inside a field), so an exported file can be re-imported.
const parseCsvRow = (line: string): string[] => {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current.trim());
  return cells;
};

export interface ParseCsvResult {
  products: Product[];
  warnings: string[];
}

export const parseCsvToProducts = (csvText: string): ParseCsvResult => {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw new Error("The CSV file is empty.");
  }

  // Skip the header row only when the first cell is actually one of our known
  // headers (id/name) — a data row can't be mistaken for a header this way.
  const firstCell = parseCsvRow(lines[0])[0]?.toLowerCase().trim() ?? "";
  const dataLines =
    firstCell === "id" || firstCell === "name" ? lines.slice(1) : lines;

  if (dataLines.length > MAX_CSV_ROWS) {
    throw new Error(
      `The CSV contains ${dataLines.length} rows — the import limit is ${MAX_CSV_ROWS}. Split the file into smaller parts and import them one at a time.`
    );
  }

  const warnings: string[] = [];
  const validCategories: Category[] = [
    "Smartphone",
    "Tablet",
    "Laptop",
    "Audio",
    "Accessories",
  ];

  const products: Product[] = dataLines.map((line, index) => {
    const cells = parseCsvRow(line);

    // The id column is ignored: ids from an edited/duplicated CSV could collide,
    // which would break React keys and storage lookups. Fresh ids guarantee
    // uniqueness for every imported row.
    const [, name, category, price, quantity] = cells;

    if (!name) {
      throw new Error(`Invalid row on line ${index + 1}: name is missing.`);
    }

    const parsedPrice = Number(price);
    const parsedQuantity = Number(quantity);

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      throw new Error(
        `Invalid row on line ${index + 1}: price must be a number of 0 or more.`
      );
    }
    if (Number.isNaN(parsedQuantity) || parsedQuantity < 0) {
      throw new Error(
        `Invalid row on line ${index + 1}: quantity must be a number of 0 or more.`
      );
    }

    const isKnownCategory = validCategories.includes(category as Category);
    if (!isKnownCategory) {
      warnings.push(
        `Row ${index + 1} ("${name}"): unknown category "${category || "—"}" — set to Accessories.`
      );
    }

    return {
      id: generateId(),
      name,
      category: isKnownCategory ? (category as Category) : "Accessories",
      price: parsedPrice,
      quantity: parsedQuantity,
    };
  });

  return { products, warnings };
};
