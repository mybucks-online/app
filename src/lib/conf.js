import { ethers } from "ethers";
const abi = new ethers.AbiCoder();

/**
 * [CRITICAL] DON'T CHANGE FOREVER!!!
 * Reference:
 *    https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#scrypt
 */
export const HASH_OPTIONS = {
  N: 32768, // CPU/memory cost parameter, 2^15
  r: 8, // block size parameter
  p: import.meta.env.DEV ? 1 : 5, // parallelization parameter
  keyLen: 64,
};
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;
export const PASSCODE_MIN_LENGTH = 6;
export const PASSCODE_MAX_LENGTH = 16;

export const PASSCODE_MAX_TRY = 3;

export const generateSalt = (password, passcode) =>
  `${password.slice(-4)}${passcode}`;
export const getEvmPrivateKey = (h) =>
  ethers.keccak256(abi.encode(["string"], [h]));

export const NETWORK = Object.freeze({
  EVM: "evm",
  TRON: "tron",
});

export const DEFAULT_NETWORK = NETWORK.EVM;
export const DEFAULT_CHAIN_ID = 1;

export const EVM_NETWORKS = {
  1: {
    chainId: 1,
    name: "ethereum",
    label: "Ethereum",
    provider:
      "https://mainnet.infura.io/v3/" + import.meta.env.VITE_INFURA_API_KEY,
    scanner: "https://etherscan.io",
  },
  56: {
    chainId: 56,
    name: "bsc",
    label: "BNB Chain",
    provider: "https://bsc-dataseed.binance.org/",
    scanner: "https://bscscan.com",
  },
  137: {
    chainId: 137,
    name: "polygon",
    label: "Polygon",
    provider:
      "https://polygon-mainnet.infura.io/v3/" +
      import.meta.env.VITE_INFURA_API_KEY,
    scanner: "https://polygonscan.com",
  },
  42161: {
    chainId: 42161,
    name: "arbitrum",
    label: "Arbitrum",
    provider:
      "https://arbitrum-mainnet.infura.io/v3/" +
      import.meta.env.VITE_INFURA_API_KEY,
    scanner: "https://arbiscan.io",
  },
  43114: {
    chainId: 43114,
    name: "avalanche",
    label: "Avalanche C-Chain",
    provider:
      "https://avalanche-mainnet.infura.io/v3/" +
      import.meta.env.VITE_INFURA_API_KEY,
    scanner: "https://snowtrace.io",
  },
  10: {
    chainId: 10,
    name: "optimism",
    label: "Optimism",
    provider:
      "https://optimism-mainnet.infura.io/v3/" +
      import.meta.env.VITE_INFURA_API_KEY,
    scanner: "https://optimistic.etherscan.io",
  },
  59144: {
    chainId: 59144,
    name: "linea",
    label: "Linea",
    provider:
      "https://linea-mainnet.infura.io/v3/" +
      import.meta.env.VITE_INFURA_API_KEY,
    scanner: "https://lineascan.build",
  },
  42220: {
    chainId: 42220,
    name: "celo",
    label: "Celo",
    provider:
      "https://celo-mainnet.infura.io/v3/" +
      import.meta.env.VITE_INFURA_API_KEY,
    scanner: "https://celoscan.io",
  },
};

export const GAS_PRICE = Object.freeze({
  HIGH: "high",
  AVERAGE: "average",
  LOW: "low",
});

// After broadcasting raw transaction, it will monitor the confirmation result in every 1000ms
export const TRON_TXN_POLLING_INTERVAL = 1000;
// https://developers.tron.network/docs/resource-model#bandwidth
export const TRON_BANDWIDTH_PRICE = 1000; // 1000 Sun
export const TRON_ENERGY_PRICE = 210; // 210 Sun

// Do not forget dividing by 100n in gas price calculation
export const gasMultiplier = (option) =>
  option === GAS_PRICE.HIGH ? 175n : option === GAS_PRICE.AVERAGE ? 150n : 100n;

// 15 minutes, after this period, wallet will be locked.
export const IDLE_DURATION = 900_000;

// in every 15 seconds, it refreshes gas price or network status
export const REFRESH_STATUS_DURATION = 15_000;

// The hidden balances will be displayed as shown below
export const BALANCE_PLACEHOLDER = "*****";
export const LOADING_PLACEHOLDER = "-----";
