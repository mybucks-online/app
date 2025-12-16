export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;
export const PASSCODE_MIN_LENGTH = 6;
export const PASSCODE_MAX_LENGTH = 16;

export const PASSCODE_MAX_TRY = 3;

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
    provider:
      "https://mainnet.infura.io/v3/" + import.meta.env.VITE_INFURA_API_KEY,
    scanner: "https://etherscan.io",
  },
  {
    chainId: 137,
    name: "polygon",
    label: "Polygon",
    provider:
      "https://polygon-mainnet.infura.io/v3/" +
      import.meta.env.VITE_INFURA_API_KEY,
    scanner: "https://polygonscan.com",
  },
  {
    chainId: 42161,
    name: "arbitrum",
    label: "Arbitrum",
    provider:
      "https://arbitrum-mainnet.infura.io/v3/" +
      import.meta.env.VITE_INFURA_API_KEY,
    scanner: "https://arbiscan.io",
  },
  {
    chainId: 10,
    name: "optimism",
    label: "Optimism",
    provider:
      "https://optimism-mainnet.infura.io/v3/" +
      import.meta.env.VITE_INFURA_API_KEY,
    scanner: "https://optimistic.etherscan.io",
  },
  {
    chainId: 56,
    name: "bsc",
    label: "BNB Chain",
    provider: "https://bsc-dataseed.binance.org/",
    scanner: "https://bscscan.com",
  },
  {
    chainId: 43114,
    name: "avalanche",
    label: "Avalanche",
    provider:
      "https://avalanche-mainnet.infura.io/v3/" +
      import.meta.env.VITE_INFURA_API_KEY,
    scanner: "https://snowtrace.io",
  },
  {
    chainId: 8453,
    name: "base",
    label: "Base",
    provider:
      "https://base-mainnet.infura.io/v3/" +
      import.meta.env.VITE_INFURA_API_KEY,
    scanner: "https://basescan.org",
  },
];

export const findNetworkByName = (networkName) => {
  if (networkName === NETWORK.TRON) {
    return [NETWORK.TRON, 1];
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
  "It never stores or transmits your password.",
  "Your account's origin remains anonymous.",
  "There's no reset or recovery option.",
];

export const TEST_PASSWORD = "DemoAccount5&";
export const TEST_PASSCODE = "112324";
