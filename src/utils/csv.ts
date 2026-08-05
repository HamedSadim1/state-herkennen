import { Product, Category } from "../types/product";
import { generateId } from "./formatters";

const CSV_HEADERS = ["id", "name", "category", "price", "quantity"] as const;

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

export const parseCsvToProducts = (csvText: string): Product[] => {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw new Error("Het CSV-bestand is leeg.");
  }

  // Skip header row if it matches our known headers
  const dataLines = lines[0].toLowerCase().includes("name")
    ? lines.slice(1)
    : lines;

  const products: Product[] = dataLines.map((line, index) => {
    const cells = parseCsvRow(line);

    const [id, name, category, price, quantity] = cells;

    if (!name) {
      throw new Error(`Ongeldige rij op regel ${index + 1}: naam ontbreekt.`);
    }

    const parsedPrice = Number(price);
    const parsedQuantity = Number(quantity);

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      throw new Error(
        `Ongeldige rij op regel ${index + 1}: prijs moet een getal van 0 of meer zijn.`
      );
    }
    if (Number.isNaN(parsedQuantity) || parsedQuantity < 0) {
      throw new Error(
        `Ongeldige rij op regel ${index + 1}: voorraad moet een getal van 0 of meer zijn.`
      );
    }

    const validCategories: Category[] = [
      "Smartphone",
      "Tablet",
      "Laptop",
      "Audio",
      "Accessories",
    ];

    return {
      id: id || generateId(),
      name,
      category: validCategories.includes(category as Category)
        ? (category as Category)
        : "Accessories",
      price: parsedPrice,
      quantity: parsedQuantity,
    };
  });

  return products;
};
