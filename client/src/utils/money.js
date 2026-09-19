// Prices are shown in US dollars, like the wireframes. Intl.NumberFormat
// handles the symbol, commas and exactly two decimals.
const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export const formatPrice = (amount) => formatter.format(Number(amount) || 0)
