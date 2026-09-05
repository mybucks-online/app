import { createContext, useEffect, useMemo, useState } from "react";

import EvmAccount from "@mybucks/lib/account/evm";
import TronAccount from "@mybucks/lib/account/tron";
import {
  DEFAULT_CHAIN_ID,
  DEFAULT_NETWORK,
  ENABLE_TOKEN_HISTORY,
  NETWORK,
  REFRESH_STATUS_DURATION,
} from "@mybucks/lib/conf";

export const StoreContext = createContext({
  connectivity: true,
  passphrase: "",
  pin: "",
  hash: "",
  legacy: false,
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

  /** tokenBalances[0] is always the native token when loaded */
  tokenBalances: [],
  nativeToken: null,
  nftBalances: [],

  tick: 0,

  fetchBalances: () => {},
  fetchPrices: () => {},

  selectedTokenAddress: "",
  selectToken: () => {},

  theme: "light",
  toggleTheme: () => {},
});

const StoreProvider = ({ children }) => {
  const [connectivity, setConnectivity] = useState(true);
  // key parts
  const [passphrase, setPassphrase] = useState("");
  const [pin, setPin] = useState("");
  const [hash, setHash] = useState("");
  const [legacy, setLegacy] = useState(false);

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
    [hash, network, chainId],
  );

  // common
  const [loading, setLoading] = useState(false);
  const [inMenu, openMenu] = useState(false);
  const [showBalances, setShowBalances] = useState(false);

  // balances related — native is always tokenBalances[0]
  const [tokenBalances, setTokenBalances] = useState([]);
  const [nftBalances, setNftBalances] = useState([]);
  const nativeToken = useMemo(
    () => tokenBalances.find((t) => t.native) ?? tokenBalances[0] ?? null,
    [tokenBalances],
  );

  // transfers history
  const [transfers, setTransfers] = useState([]);

  // active token
  const [selectedTokenAddress, selectToken] = useState("");
  const token = useMemo(
    () => tokenBalances.find((t) => t.address === selectedTokenAddress),
    [tokenBalances, selectedTokenAddress],
  );

  // unique counter that increments regularly
  const [tick, setTick] = useState(0);

  const fetchPrices = async (balances) => {
    if (!account) {
      return;
    }

    const source = balances ?? tokenBalances;
    if (!source.length) {
      return;
    }

    try {
      const pricedBalances = await account.queryPrices(source);
      if (pricedBalances?.length) {
        setTokenBalances(pricedBalances);
      }
    } catch {
      // Keep last known balances if price enrichment fails.
    }
  };

  const fetchBalances = async () => {
    if (!account) {
      return;
    }

    setLoading(true);

    try {
      const nativeBalances = await account.queryTokenBalances(true);
      const native = nativeBalances?.[0];

      if (!native) {
        setConnectivity(false);
        return;
      }

      // Paint native first for faster UX
      setTokenBalances(nativeBalances);
      setConnectivity(true);

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

  useEffect(() => {
    if (!selectedTokenAddress) {
      setTransfers([]);
      return;
    }
    if (!ENABLE_TOKEN_HISTORY) {
      setTransfers([]);
      return;
    }
    account
      .queryTokenHistory(
        token.native ? "" : selectedTokenAddress,
        token.decimals,
      )
      .then((result) => {
        setTransfers(result);
      });
  }, [selectedTokenAddress]);

  const reset = () => {
    setPassphrase("");
    setPin("");
    setHash("");
    setLegacy(false);

    setNetwork(DEFAULT_NETWORK);
    setChainId(DEFAULT_CHAIN_ID);

    setLoading(false);
    openMenu(false);
    setShowBalances(false);

    setTokenBalances([]);
    setNftBalances([]);
    setTransfers([]);

    selectToken("");
  };

  const setup = (pw, pc, lgcy, hsh, nw, cid) => {
    setPassphrase(pw);
    setPin(pc);
    setLegacy(lgcy);
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

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <StoreContext.Provider
      value={{
        connectivity,
        passphrase,
        pin,
        hash,
        legacy,
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
        tokenBalances,
        nativeToken,
        nftBalances,
        transfers,
        tick,
        fetchBalances,
        fetchPrices,
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
