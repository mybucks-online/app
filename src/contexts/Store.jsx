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
  setup: () => {},
  reset: () => {},

  // evm | tron
  network: DEFAULT_NETWORK,
  chainId: DEFAULT_CHAIN_ID,
  account: null,
  updateNetwork: () => {},

  loading: false,
  inMenu: false,
  openMenu: () => {},
  showBalances: false,
  setShowBalances: () => {},

  nativeTokenName: "",
  nativeTokenBalance: 0,
  tokenBalances: [],
  nftBalances: [],

  nativeTokenPrice: 0,
  tick: 0,

  fetchBalances: () => {},

  selectedTokenAddress: "",
  selectToken: () => {},

  theme: "light",
  toggleTheme: () => {},
});

const StoreProvider = ({ children }) => {
  const [connectivity, setConnectivity] = useState(true);
  // key parts
  const [password, setPassword] = useState("");
  const [passcode, setPasscode] = useState("");
  const [hash, setHash] = useState("");

  // theme related
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "dark";
  });

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

  // balances related
  const [nativeTokenName, setNativeTokenName] = useState("");
  const [nativeTokenBalance, setNativeTokenBalance] = useState(0);
  const [tokenBalances, setTokenBalances] = useState([]);
  const [nftBalances, setNftBalances] = useState([]);

  // transfers history
  const [transfers, setTransfers] = useState([]);

  // prices related
  const [nativeTokenPrice, setNativeTokenPrice] = useState(0);

  // active token
  const [selectedTokenAddress, selectToken] = useState("");
  const token = useMemo(
    () => tokenBalances.find((t) => t.address === selectedTokenAddress),
    [tokenBalances, selectedTokenAddress]
  );

  // unique counter that increments regularly
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!account) {
      return;
    }
    setNativeTokenName("");
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

  useEffect(() => {
    if (!selectedTokenAddress) {
      setTransfers([]);
      return;
    }
    account
      .queryTokenHistory(
        token.native ? "" : selectedTokenAddress,
        token.decimals
      )
      .then((result) => {
        setTransfers(result);
      });
  }, [selectedTokenAddress]);

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
    setTransfers([]);

    selectToken("");
  };

  const setup = (pw, pc, hsh, nw, cid) => {
    setPassword(pw);
    setPasscode(pc);
    setHash(hsh);

    if (nw) {
      setNetwork(nw);
    }
    if (cid) {
      setChainId(cid);
    }
  };

  const updateNetwork = (net, id) => {
    setNetwork(net);
    setChainId(id);
  };

  const fetchBalances = async () => {
    setLoading(true);
    const result = await account.queryBalances();

    if (result) {
      setNativeTokenName(result[0].name);
      setNativeTokenBalance(result[0].balance);
      setNativeTokenPrice(result[0].price);
      setTokenBalances(result);

      setConnectivity(true);
    } else {
      setConnectivity(false);
    }

    setLoading(false);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
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
        transfers,
        nativeTokenPrice,
        tick,
        fetchBalances,
        selectedTokenAddress,
        selectToken,
        token,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export default StoreProvider;
