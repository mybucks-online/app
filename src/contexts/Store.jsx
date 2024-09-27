import { createContext, useState, useEffect } from "react";
import EvmAccount from "@mybucks/lib/account/evm";
import {
  DEFAULT_CHAIN_ID,
  DEFAULT_NETWORK,
  DEFAULT_ASSET,
  NETWORK_EVM,
  REFRESH_STATUS_DURATION,
} from "@mybucks/lib/conf";

export const StoreContext = createContext({
  connectivity: true,
  password: "",
  passcode: "",
  salt: "",
  hash: "",
  setup: (p, pc, s, h) => {},
  reset: () => {},

  // evm | tron
  network: DEFAULT_NETWORK,
  chainId: DEFAULT_CHAIN_ID,
  account: null,
  updateChain: (c) => {},

  loading: false,
  inMenu: false,
  openMenu: (m) => {},

  nativeTokenName: DEFAULT_ASSET,
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
  const [salt, setSalt] = useState("");
  const [hash, setHash] = useState("");

  // network related
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(DEFAULT_NETWORK);
  const [chainId, setChainId] = useState(DEFAULT_CHAIN_ID);

  // common
  const [loading, setLoading] = useState(false);
  const [inMenu, openMenu] = useState(false);

  // balances related
  const [nativeTokenName, setNativeTokenName] = useState(DEFAULT_ASSET);
  const [nativeTokenBalance, setNativeTokenBalance] = useState(0);
  const [tokenBalances, setTokenBalances] = useState([]);
  const [nftBalances, setNftBalances] = useState([]);

  // prices related
  const [nativeTokenPrice, setNativeTokenPrice] = useState(0);

  // unique counter that increments regularly
  const [tick, setTick] = useState(0);

  // active token
  const [selectedTokenAddress, selectToken] = useState("");

  useEffect(() => {
    if (hash) {
      if (network === NETWORK_EVM) {
        setAccount(new EvmAccount(hash, chainId));
      }
    }
  }, [hash, chainId, network]);

  useEffect(() => {
    if (!account) {
      return;
    }
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
    setSalt("");
    setHash("");

    setChainId(DEFAULT_CHAIN_ID);
    setNetwork(DEFAULT_NETWORK);
    setAccount(null);

    setLoading(false);

    setNativeTokenName(DEFAULT_ASSET);
    setNativeTokenBalance(0);
    setTokenBalances([]);
    setNftBalances([]);

    selectToken("");
  };

  const setup = (pw, pc, s, h) => {
    setPassword(pw);
    setPasscode(pc);
    setSalt(s);
    setHash(h);
  };

  const updateChain = (id) => setChainId(id);

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
        salt,
        hash,
        reset,
        setup,
        network,
        chainId,
        account,
        updateChain,
        loading,
        inMenu,
        openMenu,
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
