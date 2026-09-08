import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useState,
} from "react";

import {
  DEFAULT_CHAIN_ID,
  DEFAULT_NETWORK,
  type NETWORK,
} from "@mybucks/lib/conf";
import type { Account } from "@mybucks/types/account";
import type {
  TokenBalance,
  TokenPrice,
  TokenPriceMap,
} from "@mybucks/types/token";

import useCredentials from "./store/useCredentials";
import useTheme, { type Theme } from "./store/useTheme";
import useTokenBalances from "./store/useTokenBalances";
import useTokenPrices from "./store/useTokenPrices";
import useTransfers from "./store/useTransfers";
import useWalletAccount from "./store/useWalletAccount";

/** The Store's full data shape as seen by every page/component. */
export interface StoreContextValue {
  connectivity: boolean;
  passphrase: string;
  pin: string;
  hash: string;
  legacy: boolean;
  reset: () => void;
  setup: (
    pw: string,
    pc: string,
    lgcy: boolean,
    hsh: string,
    nw?: NETWORK,
    cid?: number,
  ) => void;

  // evm | tron
  network: NETWORK;
  chainId: number;
  account: Account | null;
  updateNetwork: (net: NETWORK, id: number) => void;

  loading: boolean;
  inMenu: boolean;
  openMenu: Dispatch<SetStateAction<boolean>>;
  showBalances: boolean;
  setShowBalances: Dispatch<SetStateAction<boolean>>;

  /** tokenBalances[0] is always the native token when loaded */
  tokenBalances: TokenBalance[];
  nativeToken: TokenBalance | null;
  nftBalances: unknown[];

  /** symbol -> price, or `${chainId}:${address}` -> price */
  tokenPrices: TokenPriceMap;
  getTokenPrice: (t: TokenBalance | null | undefined) => TokenPrice;
  getTokenQuote: (t: TokenBalance | null | undefined) => number | null;

  transfers: unknown[];
  tick: number;

  fetchBalances: () => Promise<void>;
  fetchPrices: (balances: TokenBalance[]) => Promise<void>;

  selectedTokenAddress: string;
  selectToken: Dispatch<SetStateAction<string>>;
  token: TokenBalance | undefined;

  theme: Theme;
  toggleTheme: () => void;
}

export const StoreContext = createContext<StoreContextValue>({
  connectivity: true,
  passphrase: "",
  pin: "",
  hash: "",
  legacy: false,
  setup: () => {},
  reset: () => {},

  network: DEFAULT_NETWORK,
  chainId: DEFAULT_CHAIN_ID,
  account: null,
  updateNetwork: () => {},

  loading: false,
  inMenu: false,
  openMenu: () => {},
  showBalances: false,
  setShowBalances: () => {},

  tokenBalances: [],
  nativeToken: null,
  nftBalances: [],

  tokenPrices: {},
  getTokenPrice: () => null,
  getTokenQuote: () => null,

  transfers: [],
  tick: 0,

  fetchBalances: async () => {},
  fetchPrices: async () => {},

  selectedTokenAddress: "",
  selectToken: () => {},
  token: undefined,

  theme: "light",
  toggleTheme: () => {},
});

const StoreProvider = ({ children }: { children: ReactNode }) => {
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

  const setup: StoreContextValue["setup"] = (pw, pc, lgcy, hsh, nw, cid) => {
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

  const value: StoreContextValue = {
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
