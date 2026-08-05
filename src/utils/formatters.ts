import { PRICE_CURRENCY, PRICE_LOCALE } from "../config/constants";

export const pluralize = (
  count: number,
  singular: string,
  plural?: string
): string => (count === 1 ? singular : (plural ?? `${singular}s`));

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat(PRICE_LOCALE, {
    style: "currency",
    currency: PRICE_CURRENCY,
  }).format(price);
};

export const generateId = (): string => {
  // crypto.randomUUID requires a secure context (localhost/HTTPS).
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
