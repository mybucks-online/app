import { EVM_NETWORKS } from "@mybucks/lib/conf";

const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;

async function alchemyRpc(chainId, method, params) {
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

export async function fetchAlchemyNativeTokenBalance(chainId, address) {
  const result = await alchemyRpc(chainId, "alchemy_getTokenBalances", [
    address,
    "NATIVE_TOKEN",
  ]);

  const tokenBalance = result?.tokenBalances?.[0];
  if (!tokenBalance?.tokenBalance) {
    return "0";
  }

  return tokenBalance.tokenBalance;
}

export async function fetchAlchemyErc20TokenBalances(chainId, address) {
  const balances = [];
  let pageKey = undefined;

  do {
    const options = pageKey ? { pageKey } : {};
    const result = await alchemyRpc(chainId, "alchemy_getTokenBalances", [
      address,
      "erc20",
      options,
    ]);

    balances.push(...(result?.tokenBalances ?? []));
    pageKey = result?.pageKey;
  } while (pageKey);

  return balances;
}
