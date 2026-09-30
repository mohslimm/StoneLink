/**
 * Format a number as Algerian Dinar
 * @param {number} amount
 * @param {boolean} arabic - Show Arabic symbol دج instead of DA
 */
export function formatDA(amount, arabic = false) {
  const formatted = new Intl.NumberFormat('fr-DZ', {
    maximumFractionDigits: 0,
  }).format(amount)
  return arabic ? `${formatted} دج` : `${formatted} DA`
}

/**
 * Format with compact notation for large numbers
 */
export function formatDACompact(amount) {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M DA`
  }
  if (amount >= 1000) {
    return `${Math.floor(amount / 1000)}K DA`
  }
  return formatDA(amount)
}
