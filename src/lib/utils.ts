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

/**
 * Formats a number to Brazilian currency format (R$ 1.234,56)
 * @param value - Number value
 * @returns Formatted currency string
 */
export function formatCurrencyToBrazilian(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Parses a Brazilian currency string to a number
 * Accepts formats like: "R$ 1.234,56", "1.234,56", "1234,56", "1234.56"
 * @param currencyString - Currency string in Brazilian format
 * @returns Number value or NaN if parsing fails
 */
export function parseCurrencyFromBrazilian(currencyString: string): number {
  if (!currencyString || currencyString.trim() === '') {
    return NaN;
  }

  // Remove currency symbols and spaces
  let cleaned = currencyString
    .replace(/R\$\s*/g, '')
    .replace(/\s/g, '')
    .trim();

  // If empty after cleaning, return NaN
  if (cleaned === '') {
    return NaN;
  }

  // Check if it's already a valid number (for backwards compatibility)
  const directNumber = parseFloat(cleaned.replace(',', '.'));
  if (!isNaN(directNumber) && cleaned.match(/^[\d,.-]+$/)) {
    // If it has only one comma or dot, treat as decimal separator
    const commaCount = (cleaned.match(/,/g) || []).length;
    const dotCount = (cleaned.match(/\./g) || []).length;
    
    if (commaCount === 1 && dotCount === 0) {
      // Brazilian format: 1234,56
      return parseFloat(cleaned.replace(',', '.'));
    } else if (dotCount === 1 && commaCount === 0) {
      // US format: 1234.56
      return parseFloat(cleaned);
    } else if (commaCount === 0 && dotCount === 0) {
      // Just numbers
      return parseFloat(cleaned);
    }
  }

  // Brazilian format: thousands separated by dots, decimal by comma
  // Example: "1.234,56" -> 1234.56
  // Remove thousand separators (dots) and replace decimal separator (comma) with dot
  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');

  if (hasComma && hasDot) {
    // Has both: assume dots are thousands separators and comma is decimal
    // "1.234,56" -> remove dots, replace comma with dot
    cleaned = cleaned.replace(/\./g, '');
    cleaned = cleaned.replace(',', '.');
  } else if (hasComma && !hasDot) {
    // Only comma: could be decimal separator or thousands separator
    // If there are 3 digits after comma, it's likely thousands separator
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length === 3 && parts[0].length <= 3) {
      // Likely thousands separator: "123,456" -> 123456
      cleaned = cleaned.replace(',', '');
    } else {
      // Likely decimal separator: "1234,56" -> 1234.56
      cleaned = cleaned.replace(',', '.');
    }
  } else if (!hasComma && hasDot) {
    // Only dot: could be decimal or thousands separator
    // If there are 3 digits after dot, it's likely thousands separator
    const parts = cleaned.split('.');
    if (parts.length === 2 && parts[1].length === 3 && parts[0].length <= 3) {
      // Likely thousands separator: "123.456" -> 123456
      cleaned = cleaned.replace('.', '');
    }
    // Otherwise treat as decimal separator (already correct)
  }

  const result = parseFloat(cleaned);
  return isNaN(result) ? NaN : result;
}

/**
 * Formats a date from any format to DD/MM/YYYY for input display
 * @param dateString - Date string in any format
 * @returns Date string in DD/MM/YYYY format
 */
export function formatDateForInput(dateString: string): string {
  if (!dateString) return '';
  
  // If already in Brazilian format, return as is
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return dateString;
  }

  // Parse YYYY-MM-DD format (from HTML date input or API)
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

/**
 * Formats a number to Brazilian currency format for input display (without R$)
 * @param value - Number value
 * @returns Formatted currency string without currency symbol
 */
export function formatCurrencyForInput(value: number): string {
  if (isNaN(value) || value === null || value === undefined) {
    return '';
  }
  
  // Format with Brazilian locale but without currency symbol
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  
  return formatted;
}