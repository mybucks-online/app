import { fetchTokenPricesBySymbol } from "@mybucks/lib/providers/alchemy";

/**
 * USD prices for reference token symbols, shared across all networks.
 * Not tied to a specific chain account — see useTokenPrices.
 */
export async function queryGlobalPrices(
  symbols: readonly string[],
): Promise<Record<string, number>> {
  return await fetchTokenPricesBySymbol(symbols);
}
