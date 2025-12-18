/**
 * Currency Formatting Utilities
 *
 * Provides consistent currency formatting across the dashboard
 */

/**
 * Format a number as currency with the appropriate symbol and locale
 *
 * @param amount - The numeric amount to format
 * @param currencyCode - ISO 4217 currency code (e.g., 'USD', 'EUR', 'GBP')
 * @param options - Additional formatting options
 * @returns Formatted currency string (e.g., "$125.00", "€95.00", "£50.00")
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  options: {
    locale?: string;
    showCode?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  const {
    locale = 'en-US',
    showCode = false,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);

    // Optionally append the currency code for clarity
    if (showCode) {
      return `${formatted} ${currencyCode}`;
    }

    return formatted;
  } catch {
    // Fallback for invalid currency codes
    return `${currencyCode} ${amount.toFixed(minimumFractionDigits)}`;
  }
}

/**
 * Format currency with the code always visible (e.g., "$125.00 USD")
 * Useful when displaying amounts that may be in different currencies
 */
export function formatCurrencyWithCode(
  amount: number,
  currencyCode: string = 'USD'
): string {
  return formatCurrency(amount, currencyCode, { showCode: true });
}

/**
 * Format a compact currency value for large numbers
 * e.g., $1.2M, $50K
 */
export function formatCurrencyCompact(
  amount: number,
  currencyCode: string = 'USD'
): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(0)}`;
  }
}

/**
 * Get the currency symbol for a given currency code
 */
export function getCurrencySymbol(currencyCode: string = 'USD'): string {
  try {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(0);

    // Extract just the symbol (remove digits and spaces)
    return formatted.replace(/[\d.,\s]/g, '').trim();
  } catch {
    return currencyCode;
  }
}

/**
 * Common currency codes and their display names
 */
export const CURRENCY_INFO: Record<string, { name: string; symbol: string }> = {
  USD: { name: 'US Dollar', symbol: '$' },
  EUR: { name: 'Euro', symbol: '€' },
  GBP: { name: 'British Pound', symbol: '£' },
  CAD: { name: 'Canadian Dollar', symbol: 'CA$' },
  AUD: { name: 'Australian Dollar', symbol: 'A$' },
  JPY: { name: 'Japanese Yen', symbol: '¥' },
  CNY: { name: 'Chinese Yuan', symbol: '¥' },
  INR: { name: 'Indian Rupee', symbol: '₹' },
  BRL: { name: 'Brazilian Real', symbol: 'R$' },
  MXN: { name: 'Mexican Peso', symbol: 'MX$' },
  CHF: { name: 'Swiss Franc', symbol: 'CHF' },
  SEK: { name: 'Swedish Krona', symbol: 'kr' },
  NZD: { name: 'New Zealand Dollar', symbol: 'NZ$' },
  SGD: { name: 'Singapore Dollar', symbol: 'S$' },
  HKD: { name: 'Hong Kong Dollar', symbol: 'HK$' },
  AED: { name: 'UAE Dirham', symbol: 'AED' },
  SAR: { name: 'Saudi Riyal', symbol: 'SAR' },
};
