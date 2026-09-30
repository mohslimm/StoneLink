/**
 * Generate a booking reference like PV-2026-4721
 */
export function generateRef() {
  const year = new Date().getFullYear()
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `PV-${year}-${rand}`
}
