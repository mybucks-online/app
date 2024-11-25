import { createContext, useEffect, useMemo, useState } from "react";

import EvmAccount from "@mybucks/lib/account/evm";
import TronAccount from "@mybucks/lib/account/tron";
import {
  DEFAULT_CHAIN_ID,
  DEFAULT_NETWORK,
  NETWORK,
  REFRESH_STATUS_DURATION,
} from "@mybucks/lib/conf";

export const StoreContext = createContext({
  connectivity: true,
  password: "",
  passcode: "",
  hash: "",
  setup: (p, pc, s, h) => {},
  reset: () => {},

  // evm | tron
  network: DEFAULT_NETWORK,
  chainId: DEFAULT_CHAIN_ID,
  account: null,
  updateNetwork: (n, c) => {},

  loading: false,
  inMenu: false,
  openMenu: (m) => {},
  showBalances: false,
  setShowBalances: (f) => {},

  nativeTokenName: "",
  nativeTokenBalance: 0,
  tokenBalances: [],
  nftBalances: [],

  nativeTokenPrice: 0,
  tick: 0,

  fetchBalances: () => {},

  selectedTokenAddress: "",
  selectToken: (t) => {},
});

const StoreProvider = ({ children }) => {
  const [connectivity, setConnectivity] = useState(true);
  // key parts
  const [password, setPassword] = useState("");
  const [passcode, setPasscode] = useState("");
  const [hash, setHash] = useState("");

  // network related
  const [network, setNetwork] = useState(DEFAULT_NETWORK);
  const [chainId, setChainId] = useState(DEFAULT_CHAIN_ID);
  const account = useMemo(
    () =>
      !hash
        ? null
        : network === NETWORK.EVM
        ? new EvmAccount(hash, chainId)
        : new TronAccount(hash),
    [hash, network, chainId]
  );

  // common
  const [loading, setLoading] = useState(false);
  const [inMenu, openMenu] = useState(false);
  const [showBalances, setShowBalances] = useState(false);

  // active token
  const [selectedTokenAddress, selectToken] = useState("");

  // balances related
  const [nativeTokenName, setNativeTokenName] = useState("");
  const [nativeTokenBalance, setNativeTokenBalance] = useState(0);
  const [tokenBalances, setTokenBalances] = useState([]);
  const [nftBalances, setNftBalances] = useState([]);

  // prices related
  const [nativeTokenPrice, setNativeTokenPrice] = useState(0);

  // unique counter that increments regularly
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!account) {
      return;
    }
    setNativeTokenName("")
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
    setPassword("");
    setPasscode("");
    setHash("");

    setNetwork(DEFAULT_NETWORK);
    setChainId(DEFAULT_CHAIN_ID);

    setLoading(false);
    openMenu(false);
    setShowBalances(false);

    setNativeTokenName("");
    setNativeTokenBalance(0);
    setTokenBalances([]);
    setNftBalances([]);

    selectToken("");
  };

  const setup = (pw, pc, h) => {
    setPassword(pw);
    setPasscode(pc);
    setHash(h);
  };

  const updateNetwork = (net, id) => {
    setNetwork(net);
    setChainId(id);
  };

  const fetchBalances = async () => {
    setLoading(true);
    const result = await account.queryBalances();

    if (result) {
      setNativeTokenName(result[0]);
      setNativeTokenBalance(result[1]);
      setNativeTokenPrice(result[2]);
      setTokenBalances(result[3]);

      setConnectivity(true);
    } else {
      setConnectivity(false);
    }

    setLoading(false);
  };

  return (
    <StoreContext.Provider
      value={{
        connectivity,
        password,
        passcode,
        hash,
        reset,
        setup,
        network,
        chainId,
        account,
        updateNetwork,
        loading,
        inMenu,
        openMenu,
        showBalances,
        setShowBalances,
        nativeTokenName,
        nativeTokenBalance,
        tokenBalances,
        nftBalances,
        nativeTokenPrice,
        tick,
        fetchBalances,
        selectedTokenAddress,
        selectToken,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export default StoreProvider;
