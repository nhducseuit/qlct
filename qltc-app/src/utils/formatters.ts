import { dayjs } from 'src/boot/dayjs';

/**
 * Formats a number as VND currency.
 * @param value The number to format.
 * @returns The formatted currency string.
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(0);
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

/**
 * Formats a date string into a more readable format.
 * @param dateString The date string to format.
 * @param format The desired output format.
 * @returns The formatted date string.
 */
export const formatDate = (dateString: string, format = 'DD/MM/YYYY HH:mm'): string => {
  return dayjs(dateString).format(format);
};

/**
 * Formats a date string into a relative time string (e.g., "a few seconds ago").
 * @param dateString The date string to format.
 * @returns The relative time string.
 */
export const timeAgo = (dateString: string): string => {
  return dayjs(dateString).fromNow();
};

export const formatNumberWithThousandsSeparator = (value: number | null): string => {
  if (value === null || value === undefined) {
    return '';
  }
  return new Intl.NumberFormat('vi-VN').format(value);
};

export const parseNumberFromThousandsSeparator = (value: string): number | null => {
  if (!value) {
    return null;
  }
  // For 'vi-VN', thousand separator is '.' and decimal separator is ','
  // So, we remove '.' and replace ',' with '.' for parseFloat
  const cleanedValue = value.replace(/\./g, '').replace(/,/g, '.');
  const parsed = parseFloat(cleanedValue);
  return isNaN(parsed) ? null : parsed;
};

export const formatKiloCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return '0K₫';
  }
  if (Math.abs(value) < 1000) {
    return `${new Intl.NumberFormat('vi-VN').format(value)} ₫`; // For values less than 1000, show as is with VND
  }
  const kiloValue = value / 1000;
  // Format to 1 decimal place if needed, otherwise no decimals
  const formatted = new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(kiloValue);
  return `${formatted}K₫`;
};
