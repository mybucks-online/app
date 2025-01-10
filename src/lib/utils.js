export const truncate = (str, len = 12) =>
  str.slice(0, (len >> 1) + 2) + "..." + str.slice((len >> 1) * -1);

export const queryPrice = async (base, quote = "USD") => {
  try {
    const resp = await fetch(
      `https://api.blockchain.info/price/index?base=${base}&quote=${quote}`
    );
    const { price } = await resp.json();
    return price;
  } catch (e) {
    return 0;
  }
};

export const clearQueryParams = () => {
  const url = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, url);
};

export const formatCurrency = (
  amount,
  locale = 'en',
  currency = 'USD',
  maximumFractionDigits = 2
) =>
  Intl.NumberFormat(locale, {
    currency,
    maximumFractionDigits,
    style: "currency",
  }).format(amount);
