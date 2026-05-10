// CURRENCIES → CURRENCY_LIST করো
export const CURRENCY_LIST = [
  { code: "BDT", symbol: "৳", label: "Bangladeshi Taka" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "INR", symbol: "₹", label: "Indian Rupee" },
] as const;

export type CurrencyCode = typeof CURRENCY_LIST[number]["code"];

export function getCurrencyByCode(code: string) {
  return CURRENCY_LIST.find((c) => c.code === code) ?? CURRENCY_LIST[0];
}