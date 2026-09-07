import { fetchTokenPricesBySymbol } from "@mybucks/lib/providers/alchemy";

/**
 * USD prices for reference token symbols, shared across all networks.
 * Not tied to a specific chain account — see useTokenPrices.
 * @param {string[]} symbols
 * @returns {Promise<Record<string, number>>} symbol -> USD price
 */
export async function queryGlobalPrices(symbols) {
  return await fetchTokenPricesBySymbol(symbols);
}
