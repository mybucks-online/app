import toFlexible from "toflexible";

export const truncate = (str, len = 12) =>
  str.slice(0, (len >> 1) + 2) + "..." + str.slice((len >> 1) * -1);

export const clearQueryParams = () => {
  const url = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, url);
};

export const formatCurrency = (
  amount,
  locale = "en",
  currency = "USD",
  maximumFractionDigits = 2,
) =>
  Intl.NumberFormat(locale, {
    currency,
    maximumFractionDigits,
    style: "currency",
  }).format(amount);

export const formatBalance = (balance, decimals = 2) => {
  return toFlexible(balance, decimals) || "0.00";
};
