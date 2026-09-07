import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { NETWORK, type NetworkKind, PRICE_SYMBOLS } from "@mybucks/lib/conf";
import { queryGlobalPrices } from "@mybucks/lib/prices";
import type { Account } from "@mybucks/types/account";
import type { TokenBalance, TokenPrice, TokenPriceMap } from "@mybucks/types/token";

/** symbol for natives/Tron, else `${chainId}:${address}` */
function tokenPriceKey(
  token: TokenBalance | null | undefined,
  network: NetworkKind,
  chainId: number,
): string | null {
  if (!token) {
    return null;
  }
  if (token.native || network === NETWORK.TRON) {
    return token.symbol;
  }
  return `${chainId}:${token.address.toLowerCase()}`;
}

/**
 * symbol -> price, or `${chainId}:${address}` -> price.
 * Natives / Tron tokens are priced once via the symbol cache on mount.
 * EVM ERC-20s are priced incrementally, per chain, by contract address.
 */
const useTokenPrices = (
  account: Account | null,
  network: NetworkKind,
  chainId: number,
) => {
  const [tokenPrices, setTokenPrices] = useState<TokenPriceMap>({});
  const tokenPricesRef = useRef(tokenPrices);
  useLayoutEffect(() => {
    tokenPricesRef.current = tokenPrices;
  }, [tokenPrices]);

  const fetchSymbolPrices = async () => {
    try {
      const prices = await queryGlobalPrices(PRICE_SYMBOLS);
      if (Object.keys(prices).length) {
        setTokenPrices((prev) => ({ ...prev, ...prices }));
      }
    } catch {
      // Keep existing cache if symbol prices fail.
    }
  };

  /**
   * Addresses Alchemy cannot price are stored as null so we do not re-fetch.
   */
  const fetchPrices = async (balances: TokenBalance[]) => {
    if (!account || network !== NETWORK.EVM) {
      return;
    }

    const pricesSnapshot = tokenPricesRef.current;
    const missingAddresses = [
      ...new Set(
        balances
          .filter((t) => !t.native && t.address)
          .map((t) => t.address.toLowerCase())
          // undefined = never asked; null = asked, Alchemy had no price
          .filter(
            (address) => pricesSnapshot[`${chainId}:${address}`] === undefined,
          ),
      ),
    ];

    if (!missingAddresses.length) {
      return;
    }

    try {
      const fetched = await account.queryPrices(missingAddresses);
      setTokenPrices((prev) => {
        const next = { ...prev };
        for (const address of missingAddresses) {
          next[`${chainId}:${address}`] = fetched[address] ?? null;
        }
        return next;
      });
    } catch {
      // Keep existing cache if address prices fail.
    }
  };

  useEffect(() => {
    if (!account) {
      return;
    }

    const needsSymbolPrices = PRICE_SYMBOLS.some(
      (symbol) => tokenPricesRef.current[symbol] === undefined,
    );
    if (needsSymbolPrices) {
      fetchSymbolPrices();
    }
  }, [account]);

  const getTokenPrice = (t: TokenBalance | null | undefined): TokenPrice => {
    const key = tokenPriceKey(t, network, chainId);
    if (!key) {
      return null;
    }
    const price = tokenPrices[key];
    return price == null ? null : price;
  };

  const getTokenQuote = (t: TokenBalance | null | undefined): number | null => {
    if (!t) {
      return null;
    }
    const price = getTokenPrice(t);
    if (price == null) {
      return null;
    }
    return t.balance * price;
  };

  const reset = () => {
    setTokenPrices({});
  };

  return {
    tokenPrices,
    getTokenPrice,
    getTokenQuote,
    fetchPrices,
    reset,
  };
};

export default useTokenPrices;
