import type { Currency } from "@/lib/types";

export const BASE_CURRENCY_CODE = "SDG";

export function getCurrencyById(
  currencies: Currency[],
  id: string
): Currency | undefined {
  return currencies.find((c) => c.id === id);
}

export function getCurrencyCode(
  currencies: Currency[],
  id: string
): string {
  return getCurrencyById(currencies, id)?.code ?? BASE_CURRENCY_CODE;
}

/** Convert an amount to the base currency (SDG) using the stored exchange rate. */
export function convertToBase(amount: number, currency: Currency): number {
  return amount * currency.exchangeRate;
}

export function convertFromBase(amount: number, currency: Currency): number {
  if (currency.exchangeRate === 0) return 0;
  return amount / currency.exchangeRate;
}

export function sumInBase(
  items: { amount: number; currencyId: string }[],
  currencies: Currency[]
): number {
  return items.reduce((sum, item) => {
    const currency = getCurrencyById(currencies, item.currencyId);
    if (!currency) return sum + item.amount;
    return sum + convertToBase(item.amount, currency);
  }, 0);
}
