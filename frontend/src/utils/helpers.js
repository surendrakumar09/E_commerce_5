/**
 * Capitalizes the first letter of a string.
 * @param {string} str Input string.
 * @returns {string} Capitalized string.
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Formats a number as USD currency.
 * @param {number} amount Number to format.
 * @returns {string} Formatted price string.
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};
