import { useMemo, useState } from "react";

import EvmAccount from "@mybucks/lib/account/evm";
import TronAccount from "@mybucks/lib/account/tron";
import { DEFAULT_CHAIN_ID, DEFAULT_NETWORK, NETWORK } from "@mybucks/lib/conf";
import type { Account } from "@mybucks/types/account";

/** Wallet ready only after passphrase+PIN → Scrypt → hash → account. */
const useWalletAccount = (hash: string) => {
  const [network, setNetwork] = useState<NETWORK>(DEFAULT_NETWORK);
  const [chainId, setChainId] = useState(DEFAULT_CHAIN_ID);

  const account: Account | null = useMemo(
    () =>
      !hash
        ? null
        : network === NETWORK.EVM
          ? new EvmAccount(hash, chainId)
          : new TronAccount(hash),
    [hash, network, chainId],
  );

  const updateNetwork = (net: NETWORK, id: number) => {
    setNetwork(net);
    setChainId(id);
  };

  const reset = () => {
    setNetwork(DEFAULT_NETWORK);
    setChainId(DEFAULT_CHAIN_ID);
  };

  return {
    network,
    chainId,
    account,
    setNetwork,
    setChainId,
    updateNetwork,
    reset,
  };
};

export default useWalletAccount;
