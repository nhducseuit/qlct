export const formatCurrency = (
  value: number | null | undefined,
  currency = 'VND',
  locale = 'vi-VN',
): string => {
  if (value === null || value === undefined) {
    return ''; // Or 'N/A', or handle as needed
  }
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      // minimumFractionDigits: 0, // Optional: if you don't want decimals for VND
      // maximumFractionDigits: 0, // Optional
    }).format(value);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return String(value); // Fallback to string representation
  }
};

// You can add other formatters here as needed, e.g., for dates if not using dayjs directly in templates
