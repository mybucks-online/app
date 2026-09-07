import { createContext, useState } from "react";

import { DEFAULT_CHAIN_ID, DEFAULT_NETWORK } from "@mybucks/lib/conf";

import useCredentials from "./store/useCredentials";
import useTheme from "./store/useTheme";
import useTokenBalances from "./store/useTokenBalances";
import useTokenPrices from "./store/useTokenPrices";
import useTransfers from "./store/useTransfers";
import useWalletAccount from "./store/useWalletAccount";

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

  /** symbol -> price, or `${chainId}:${address}` -> price */
  tokenPrices: {},
  getTokenPrice: () => null,
  getTokenQuote: () => null,

  tick: 0,

  fetchBalances: () => {},
  fetchPrices: () => {},

  selectedTokenAddress: "",
  selectToken: () => {},

  theme: "light",
  toggleTheme: () => {},
});

const StoreProvider = ({ children }) => {
  const credentials = useCredentials();
  const theme = useTheme();
  const walletAccount = useWalletAccount(credentials.hash);
  const prices = useTokenPrices(
    walletAccount.account,
    walletAccount.network,
    walletAccount.chainId,
  );
  const balances = useTokenBalances(walletAccount.account, prices.fetchPrices);
  const transfers = useTransfers(walletAccount.account, balances.tokenBalances);

  const [inMenu, openMenu] = useState(false);
  const [showBalances, setShowBalances] = useState(false);

  const setup = (pw, pc, lgcy, hsh, nw, cid) => {
    credentials.setup(pw, pc, lgcy, hsh);
    if (nw) {
      walletAccount.setNetwork(nw);
    }
    if (cid) {
      walletAccount.setChainId(cid);
    }
  };

  const reset = () => {
    credentials.reset();
    walletAccount.reset();
    balances.reset();
    prices.reset();
    transfers.reset();

    openMenu(false);
    setShowBalances(false);
  };

  const value = {
    connectivity: balances.connectivity,
    passphrase: credentials.passphrase,
    pin: credentials.pin,
    hash: credentials.hash,
    legacy: credentials.legacy,
    reset,
    setup,

    network: walletAccount.network,
    chainId: walletAccount.chainId,
    account: walletAccount.account,
    updateNetwork: walletAccount.updateNetwork,

    loading: balances.loading,
    inMenu,
    openMenu,
    showBalances,
    setShowBalances,

    tokenBalances: balances.tokenBalances,
    nativeToken: balances.nativeToken,
    nftBalances: balances.nftBalances,

    tokenPrices: prices.tokenPrices,
    getTokenPrice: prices.getTokenPrice,
    getTokenQuote: prices.getTokenQuote,

    transfers: transfers.transfers,
    tick: balances.tick,

    fetchBalances: balances.fetchBalances,
    fetchPrices: prices.fetchPrices,

    selectedTokenAddress: transfers.selectedTokenAddress,
    selectToken: transfers.selectToken,
    token: transfers.token,

    theme: theme.theme,
    toggleTheme: theme.toggleTheme,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
};

export default StoreProvider;
