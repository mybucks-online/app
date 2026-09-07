import toFlexible from "toflexible";

export const truncate = (str: string, len = 12): string =>
  str.slice(0, (len >> 1) + 2) + "..." + str.slice((len >> 1) * -1);

export const clearQueryParams = (): void => {
  const url = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, url);
};

export const formatCurrency = (
  amount: number,
  locale = "en",
  currency = "USD",
  maximumFractionDigits = 2,
): string =>
  Intl.NumberFormat(locale, {
    currency,
    maximumFractionDigits,
    style: "currency",
  }).format(amount);

export const formatBalance = (balance: number, decimals = 2): string => {
  return toFlexible(balance, decimals) || "0.00";
};
