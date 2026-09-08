import { useEffect, useMemo, useState } from "react";

import { ENABLE_TOKEN_HISTORY } from "@mybucks/lib/conf";
import type { Account } from "@mybucks/types/account";
import type { TokenBalance } from "@mybucks/types/token";

const useTransfers = (
  account: Account | null,
  tokenBalances: TokenBalance[],
) => {
  const [transfers, setTransfers] = useState<unknown[]>([]);
  const [selectedTokenAddress, selectToken] = useState("");

  const token = useMemo(
    () => tokenBalances.find((t) => t.address === selectedTokenAddress),
    [tokenBalances, selectedTokenAddress],
  );

  useEffect(() => {
    if (!selectedTokenAddress) {
      setTransfers([]);
      return;
    }
    if (!ENABLE_TOKEN_HISTORY) {
      setTransfers([]);
      return;
    }
    account!
      .queryTokenHistory(
        token!.native ? "" : selectedTokenAddress,
        token!.decimals,
      )
      .then((result) => {
        setTransfers(result);
      });
  }, [selectedTokenAddress]);

  const reset = () => {
    setTransfers([]);
    selectToken("");
  };

  return {
    transfers,
    selectedTokenAddress,
    selectToken,
    token,
    reset,
  };
};

export default useTransfers;
