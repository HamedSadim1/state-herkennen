import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges conditional class names and resolves conflicting Tailwind utilities
 * (last one wins). Use everywhere instead of string concatenation/template
 * literals so conditional classes stay readable and predictable.
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
