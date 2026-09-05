export const PIN_MAX_TRY = 3;

/**
 * Token transfer history flag. History is not implemented yet — implement
 * `queryTokenHistory` before setting `VITE_ENABLE_TOKEN_HISTORY=true`.
 */
export const ENABLE_TOKEN_HISTORY =
  import.meta.env.VITE_ENABLE_TOKEN_HISTORY === "true";

export const NETWORK = Object.freeze({
  EVM: "ethereum",
  TRON: "tron",
});

export const DEFAULT_NETWORK = NETWORK.EVM;
export const DEFAULT_CHAIN_ID = 1;

export const EVM_NETWORKS = [
  {
    chainId: 1,
    name: "ethereum",
    label: "Ethereum",
    nativeToken: { symbol: "ETH", name: "Ether", decimals: 18 },
    nativeLogoURI: "/assets/icons/ethereum/0x.png",
    provider:
      "https://mainnet.infura.io/v3/" + import.meta.env.VITE_INFURA_API_KEY,
    alchemyBaseUrl: "https://eth-mainnet.g.alchemy.com/v2",
    scanner: "https://etherscan.io",
  },
  {
    chainId: 137,
    name: "polygon",
    label: "Polygon",
    nativeToken: { symbol: "POL", name: "Polygon", decimals: 18 },
    nativeLogoURI: "/assets/icons/polygon/0x.png",
    provider:
      "https://polygon-mainnet.infura.io/v3/" +
      import.meta.env.VITE_INFURA_API_KEY,
    alchemyBaseUrl: "https://polygon-mainnet.g.alchemy.com/v2",
    scanner: "https://polygonscan.com",
  },
  {
    chainId: 42161,
    name: "arbitrum",
    label: "Arbitrum",
    nativeToken: { symbol: "ETH", name: "Ether", decimals: 18 },
    nativeLogoURI: "/assets/icons/arbitrum/0x.png",
    provider:
      "https://arbitrum-mainnet.infura.io/v3/" +
      import.meta.env.VITE_INFURA_API_KEY,
    alchemyBaseUrl: "https://arb-mainnet.g.alchemy.com/v2",
    scanner: "https://arbiscan.io",
  },
  {
    chainId: 10,
    name: "optimism",
    label: "Optimism",
    nativeToken: { symbol: "ETH", name: "Ether", decimals: 18 },
    nativeLogoURI: "/assets/icons/optimism/0x.png",
    provider:
      "https://optimism-mainnet.infura.io/v3/" +
      import.meta.env.VITE_INFURA_API_KEY,
    alchemyBaseUrl: "https://opt-mainnet.g.alchemy.com/v2",
    scanner: "https://optimistic.etherscan.io",
  },
  {
    chainId: 56,
    name: "bsc",
    label: "BNB Chain",
    nativeToken: { symbol: "BNB", name: "BNB", decimals: 18 },
    nativeLogoURI: "/assets/icons/bsc/0x.png",
    provider: "https://bsc-dataseed.binance.org/",
    alchemyBaseUrl: "https://bnb-mainnet.g.alchemy.com/v2",
    scanner: "https://bscscan.com",
  },
  {
    chainId: 43114,
    name: "avalanche",
    label: "Avalanche",
    nativeToken: { symbol: "AVAX", name: "Avalanche", decimals: 18 },
    nativeLogoURI: "/assets/icons/avalanche/0x.png",
    provider:
      "https://avalanche-mainnet.infura.io/v3/" +
      import.meta.env.VITE_INFURA_API_KEY,
    alchemyBaseUrl: "https://avax-mainnet.g.alchemy.com/v2",
    scanner: "https://snowtrace.io",
  },
  {
    chainId: 8453,
    name: "base",
    label: "Base",
    nativeToken: { symbol: "ETH", name: "Ether", decimals: 18 },
    nativeLogoURI: "/assets/icons/base/0x.png",
    provider:
      "https://base-mainnet.infura.io/v3/" +
      import.meta.env.VITE_INFURA_API_KEY,
    alchemyBaseUrl: "https://base-mainnet.g.alchemy.com/v2",
    scanner: "https://basescan.org",
  },
  {
    chainId: 143,
    name: "monad",
    label: "Monad",
    nativeToken: { symbol: "MON", name: "Monad", decimals: 18 },
    nativeLogoURI: "/assets/icons/monad/0x.png",
    provider:
      "https://monad-mainnet.infura.io/v3/" +
      import.meta.env.VITE_INFURA_API_KEY,
    alchemyBaseUrl: "https://monad-mainnet.g.alchemy.com/v2",
    scanner: "https://monadscan.com",
  },
];

/** Tron mainnet — single network, same shape as an EVM_NETWORKS item. */
export const TRON_NETWORK = {
  chainId: 1,
  name: "tron",
  label: "Tron",
  nativeToken: {
    symbol: "TRX",
    name: "TRON",
    decimals: 6,
    address: "41eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  },
  nativeLogoURI: "/assets/icons/tron/trx.png",
  provider: "https://api.trongrid.io",
  scanner: "https://tronscan.org",
  tokens: [
    {
      address: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
      name: "Tether USD",
      symbol: "USDT",
      decimals: 6,
      logoURI: "/assets/icons/tron/tether.png",
    },
  ],
};

export const findNetworkByName = (networkName) => {
  if (networkName === NETWORK.TRON) {
    return [NETWORK.TRON, TRON_NETWORK.chainId];
  }

  const { chainId } = EVM_NETWORKS.find((item) => item.name === networkName);
  return [NETWORK.EVM, chainId];
};

export const findNetworkNameByChainId = (network, chainId) => {
  if (network === NETWORK.TRON) {
    return NETWORK.TRON;
  }

  const { name } = EVM_NETWORKS.find((item) => item.chainId === chainId);
  return name;
};

export const GAS_PRICE = Object.freeze({
  HIGH: "high",
  AVERAGE: "average",
  LOW: "low",
});

// https://developers.tron.network/docs/resource-model#bandwidth
export const TRON_BANDWIDTH_PRICE = 1000; // 1000 Sun
export const TRON_ENERGY_PRICE = 210; // 210 Sun

// Do not forget dividing by 100n in gas price calculation
export const gasMultiplier = (option) =>
  option === GAS_PRICE.HIGH ? 175n : option === GAS_PRICE.AVERAGE ? 150n : 100n;

// 15 minutes, after this period, wallet will be locked.
export const IDLE_DURATION = 900_000;

// in every 30 seconds, it refreshes gas price or network status
export const REFRESH_STATUS_DURATION = 30_000;

// The hidden balances will be displayed as shown below
export const BALANCE_PLACEHOLDER = "*****";
export const LOADING_PLACEHOLDER = "-----";

export const UNKNOWN_FACTS = [
  "Each credential creates a unique account.",
  "It runs only in your browser.",
  "It never stores or transmits your credentials.",
  "Your account's origin remains anonymous.",
  "There's no reset or recovery option.",
];

export const WALLET_URL_PARAM = "wallet";

export const TEST_PASSPHRASE = "DemoAccount5&";
export const TEST_PIN = "112324";
