import { Product } from "@/types/product";
import {
  CATEGORIES,
  CSV_DOWNLOAD_FILENAME,
  CSV_HEADERS,
  CSV_MIME_TYPE,
  FALLBACK_CATEGORY,
  MAX_CSV_ROWS,
  type Category,
} from "@/config/constants";
import { generateId } from "./formatters";

export const escapeCsvCell = (value: string | number): string => {
  const stringValue = String(value);
  const needsQuote = /[",\n]/.test(stringValue);
  const escaped = stringValue.replace(/"/g, '""');
  // Neutralize spreadsheet formula injection: cells starting with = + - @
  // would be executed as formulas when the CSV is opened in Excel/Sheets.
  // The apostrophe goes inside the quotes for quoted cells so parsers still
  // see a single, well-formed field ("'=foo,bar" instead of '"=foo,bar").
  const safeValue = /^[=+\-@]/.test(stringValue) ? `'${escaped}` : escaped;
  return needsQuote ? `"${safeValue}"` : safeValue;
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

  const blob = new Blob([csv], { type: CSV_MIME_TYPE });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = CSV_DOWNLOAD_FILENAME;
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

  // Skip the header row when the first line looks like a header: at least two
  // cells match a known column name. A plain data row can't satisfy this,
  // which also covers CSVs whose header doesn't start with id/name.
  // Derived from the same columns used for export, so both always agree.
  const HEADER_CELLS = new Set<string>(CSV_HEADERS);
  const firstRowCells = parseCsvRow(lines[0]).map((cell) =>
    cell.toLowerCase().trim()
  );
  const headerMatchCount = firstRowCells.filter((cell) =>
    HEADER_CELLS.has(cell)
  ).length;
  const dataLines = headerMatchCount >= 2 ? lines.slice(1) : lines;

  if (dataLines.length > MAX_CSV_ROWS) {
    throw new Error(
      `The CSV contains ${dataLines.length} rows — the import limit is ${MAX_CSV_ROWS}. Split the file into smaller parts and import them one at a time.`
    );
  }

  const warnings: string[] = [];

  const products: Product[] = dataLines.map((line, index) => {
    const cells = parseCsvRow(line);

    // Ids from an edited/duplicated CSV could collide, which would break React
    // keys and storage lookups, so every imported row gets a fresh id and the
    // id column (if present) is ignored. Foreign CSVs without an id column
    // shift the data cells one position left.
    const hasIdColumn = cells.length >= 5;
    const name = hasIdColumn ? cells[1] : cells[0];
    const category = hasIdColumn ? cells[2] : cells[1];
    const price = hasIdColumn ? cells[3] : cells[2];
    const quantity = hasIdColumn ? cells[4] : cells[3];

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

    const isKnownCategory = CATEGORIES.includes(category as Category);
    if (!isKnownCategory) {
      warnings.push(
        `Row ${index + 1} ("${name}"): unknown category "${category || "—"}" — set to ${FALLBACK_CATEGORY}.`
      );
    }

    return {
      id: generateId(),
      name,
      category: isKnownCategory ? (category as Category) : FALLBACK_CATEGORY,
      price: parsedPrice,
      quantity: parsedQuantity,
    };
  });

  return { products, warnings };
};
