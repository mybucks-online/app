/** A wallet balance entry — returned by Account#queryTokenBalances. */
export interface TokenBalance {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  /** Human-readable amount (already divided by 10**decimals). */
  balance: number;
  /** Smallest-unit amount, as a string (safe for values beyond Number precision). */
  rawBalance: string;
  native: boolean;
  /** Only set by EvmAccount; not read anywhere today. */
  chainId?: number;
}

/** A cached USD price: a known value, or `null` once the provider confirmed none exists. */
export type TokenPrice = number | null;

/** symbol -> price, or `${chainId}:${address}` -> price. */
export type TokenPriceMap = Record<string, TokenPrice>;
