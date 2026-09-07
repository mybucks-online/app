import { EVM_NETWORKS } from "@mybucks/lib/conf";

import whitelistsJson from "./whitelists.json";

interface WhitelistEntry {
  address: string;
  network?: string;
  chainId?: number;
}

const whitelists = whitelistsJson as WhitelistEntry[];

const networkNameToChainId: Record<string, number> = Object.fromEntries(
  EVM_NETWORKS.map((n) => [n.name, n.chainId]),
);

const whitelistKeys = new Set(
  whitelists
    .map((entry) => {
      const chainId = entry.chainId ?? networkNameToChainId[entry.network!];
      if (!chainId || !entry.address) {
        return null;
      }
      return `${chainId}:${entry.address.toLowerCase()}`;
    })
    .filter((key): key is string => Boolean(key)),
);

export function isWhitelistedToken(
  chainId: number,
  tokenAddress?: string | null,
): boolean {
  if (!tokenAddress) {
    return false;
  }
  return whitelistKeys.has(`${chainId}:${tokenAddress.toLowerCase()}`);
}
