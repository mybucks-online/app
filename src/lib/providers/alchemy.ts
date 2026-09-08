import { EVM_NETWORKS } from "@mybucks/lib/conf";

const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;

export interface AlchemyRawTokenBalance {
  contractAddress?: string;
  tokenBalance?: string;
}

interface AlchemyTokenBalancesResult {
  tokenBalances?: AlchemyRawTokenBalance[];
  pageKey?: string;
}

interface AlchemyPriceEntry {
  currency?: string;
  value?: string;
}

interface AlchemyPriceItem {
  symbol?: string;
  address?: string;
  error?: unknown;
  prices?: AlchemyPriceEntry[];
}

interface AlchemyPricesResponse {
  data?: AlchemyPriceItem[];
}

async function alchemyRpc<T>(
  chainId: number,
  method: string,
  params: unknown[],
): Promise<T> {
  const baseUrl = EVM_NETWORKS.find(
    (n) => n.chainId === chainId,
  )?.alchemyBaseUrl;
  if (!baseUrl || !ALCHEMY_API_KEY) {
    throw new Error("Alchemy is not configured for this chain");
  }

  const response = await fetch(`${baseUrl}/${ALCHEMY_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`Alchemy request failed (${response.status})`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message || "Alchemy RPC error");
  }

  return data.result;
}

export async function fetchNativeTokenBalance(
  chainId: number,
  address: string,
): Promise<string> {
  const result = await alchemyRpc<AlchemyTokenBalancesResult>(
    chainId,
    "alchemy_getTokenBalances",
    [address, "NATIVE_TOKEN"],
  );

  const tokenBalance = result?.tokenBalances?.[0];
  if (!tokenBalance?.tokenBalance) {
    return "0";
  }

  return tokenBalance.tokenBalance;
}

export async function fetchErc20TokenBalances(
  chainId: number,
  address: string,
): Promise<AlchemyRawTokenBalance[]> {
  const balances: AlchemyRawTokenBalance[] = [];
  let pageKey: string | undefined = undefined;

  do {
    const options: { pageKey?: string } = pageKey ? { pageKey } : {};
    const result = await alchemyRpc<AlchemyTokenBalancesResult>(
      chainId,
      "alchemy_getTokenBalances",
      [address, "erc20", options],
    );

    balances.push(...(result?.tokenBalances ?? []));
    pageKey = result?.pageKey;
  } while (pageKey);

  return balances;
}

/** Extracts the USD price from a Prices API response item, or undefined if missing/invalid. */
function extractUsdPrice(item: AlchemyPriceItem): number | undefined {
  if (item.error) {
    return undefined;
  }
  const usd = (item.prices ?? []).find(
    (p) => p.currency?.toLowerCase() === "usd",
  );
  const value = Number(usd?.value);
  return Number.isFinite(value) ? value : undefined;
}

/** Alchemy Prices API — Token Prices By Symbol. Returns symbol -> USD price. */
export async function fetchTokenPricesBySymbol(
  symbols: readonly string[] = [],
): Promise<Record<string, number>> {
  if (!ALCHEMY_API_KEY || !symbols.length) {
    return {};
  }

  const params = new URLSearchParams();
  for (const symbol of symbols) {
    params.append("symbols", symbol);
  }

  const response = await fetch(
    `https://api.g.alchemy.com/prices/v1/${ALCHEMY_API_KEY}/tokens/by-symbol?${params}`,
    {
      headers: { Accept: "application/json" },
    },
  );

  if (!response.ok) {
    throw new Error(`Alchemy prices-by-symbol failed (${response.status})`);
  }

  const payload: AlchemyPricesResponse = await response.json();
  const prices: Record<string, number> = {};

  for (const item of payload?.data ?? []) {
    if (!item.symbol) {
      continue;
    }
    const value = extractUsdPrice(item);
    if (value !== undefined) {
      prices[item.symbol] = value;
    }
  }

  return prices;
}

/** Alchemy Prices API — Token Prices By Address (single network, ≤25 addresses). Returns lowercase address -> USD price. */
export async function fetchTokenPricesByAddress(
  network: string,
  addresses: string[] = [],
): Promise<Record<string, number>> {
  if (!ALCHEMY_API_KEY || !network || !addresses.length) {
    return {};
  }

  const response = await fetch(
    `https://api.g.alchemy.com/prices/v1/${ALCHEMY_API_KEY}/tokens/by-address`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        addresses: addresses.map((address) => ({ network, address })),
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Alchemy prices-by-address failed (${response.status})`);
  }

  const payload: AlchemyPricesResponse = await response.json();
  const prices: Record<string, number> = {};

  for (const item of payload?.data ?? []) {
    if (!item.address) {
      continue;
    }
    // Skip "Price not found" and other per-token errors — omit from map
    const value = extractUsdPrice(item);
    if (value !== undefined) {
      prices[item.address.toLowerCase()] = value;
    }
  }

  return prices;
}
