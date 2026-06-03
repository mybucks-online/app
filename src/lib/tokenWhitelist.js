import whitelists from "@mybucks/lib/whitelists.json";
import { EVM_NETWORKS } from "@mybucks/lib/conf";

const networkNameToChainId = Object.fromEntries(
  EVM_NETWORKS.map((n) => [n.name, n.chainId]),
);

const whitelistKeys = new Set(
  whitelists
    .map((entry) => {
      const chainId = entry.chainId ?? networkNameToChainId[entry.network];
      if (!chainId || !entry.address) {
        return null;
      }
      return `${chainId}:${entry.address.toLowerCase()}`;
    })
    .filter(Boolean),
);

export function isWhitelistedToken(chainId, tokenAddress) {
  if (!tokenAddress) {
    return false;
  }
  return whitelistKeys.has(`${chainId}:${tokenAddress.toLowerCase()}`);
}
