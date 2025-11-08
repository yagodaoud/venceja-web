import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parses a date string that might be in Brazilian format (DD/MM/YYYY) or ISO format
 * @param dateString - Date string in DD/MM/YYYY or ISO format
 * @returns Date object or Invalid Date if parsing fails
 */
export function parseDate(dateString: string): Date {
  // Try to parse as Brazilian format first (DD/MM/YYYY)
  const brazilianFormatRegex = /^(\d{2})\/(\d{2})\/(\d{4})/;
  const match = dateString.match(brazilianFormatRegex);

  if (match) {
    const [, day, month, year] = match;
    // Create date in YYYY-MM-DD format (month is 0-indexed in JS Date)
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // Fall back to standard Date parsing (ISO format, etc.)
  return new Date(dateString);
}

/**
 * Formats a date string from YYYY-MM-DD format to Brazilian format (DD/MM/YYYY)
 * This avoids timezone issues that can occur with Date parsing
 * @param dateString - Date string in YYYY-MM-DD format (from HTML date input)
 * @returns Date string in DD/MM/YYYY format
 */
export function formatDateToBrazilian(dateString: string): string {
  // If already in Brazilian format, return as is
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return dateString;
  }

  // Parse YYYY-MM-DD format
  const isoFormatRegex = /^(\d{4})-(\d{2})-(\d{2})/;
  const match = dateString.match(isoFormatRegex);

  if (match) {
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }

  // Fallback: try to parse as Date and format
  const date = parseDate(dateString);
  if (isNaN(date.getTime())) {
    return dateString; // Return original if parsing fails
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}