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
