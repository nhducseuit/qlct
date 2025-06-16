// src/utils/formatters.ts

/**
 * Formats a number as VND currency.
 * @param value The number to format.
 * @returns The formatted currency string.
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};
