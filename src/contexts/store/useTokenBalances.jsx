import { useEffect, useMemo, useState } from "react";

import { REFRESH_STATUS_DURATION } from "@mybucks/lib/conf";

/** native is always tokenBalances[0] once loaded */
const useTokenBalances = (account, fetchPrices) => {
  const [loading, setLoading] = useState(false);
  const [connectivity, setConnectivity] = useState(true);
  const [tokenBalances, setTokenBalances] = useState([]);
  const [nftBalances, setNftBalances] = useState([]);
  const [tick, setTick] = useState(0);

  const nativeToken = useMemo(
    () => tokenBalances.find((t) => t.native) ?? tokenBalances[0] ?? null,
    [tokenBalances],
  );

  const fetchBalances = async () => {
    if (!account) {
      return;
    }

    setLoading(true);

    try {
      // Query native token balances
      const nativeBalances = await account.queryTokenBalances(true);
      const native = nativeBalances?.[0];

      if (!native) {
        setConnectivity(false);
        return;
      }

      // Paint native first for faster UX
      setTokenBalances(nativeBalances);
      setConnectivity(true);

      // Query ERC-20 / TRC-20 token balances
      const nonNativeBalances = await account.queryTokenBalances(false);
      const mergedBalances = [...nativeBalances, ...nonNativeBalances];
      setTokenBalances(mergedBalances);
      setLoading(false);

      await fetchPrices(mergedBalances);
    } catch {
      setConnectivity(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!account) {
      return;
    }

    setTokenBalances([]);
    account.getNetworkStatus().then(() => {
      setTick((_tick) => _tick + 1);
    });
    fetchBalances();

    const timerId = setInterval(() => {
      account
        .getNetworkStatus()
        .then(() => {
          setConnectivity(true);
        })
        .catch(() => {
          setConnectivity(false);
        })
        .finally(() => {
          setTick((_tick) => _tick + 1);
        });
    }, REFRESH_STATUS_DURATION);

    return () => {
      clearInterval(timerId);
    };
  }, [account]);

  const reset = () => {
    setLoading(false);
    setTokenBalances([]);
    setNftBalances([]);
  };

  return {
    loading,
    connectivity,
    tokenBalances,
    nftBalances,
    nativeToken,
    tick,
    fetchBalances,
    reset,
  };
};

export default useTokenBalances;
