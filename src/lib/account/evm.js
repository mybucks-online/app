import { getEvmPrivateKey } from "@mybucks.online/core";
import { tokens as defaultTokensList } from "@uniswap/default-token-list";
import { Contract, ethers } from "ethers";

import { EVM_NETWORKS, NETWORK } from "@mybucks/lib/conf";
import {
  fetchAlchemyErc20TokenBalances,
  fetchAlchemyNativeTokenBalance,
} from "@mybucks/lib/providers/alchemy";
import { isWhitelistedToken } from "@mybucks/lib/whitelists";

import IERC20 from "./erc20.json";

const erc20TokensByChainAndAddress = new Map(
  defaultTokensList.map((token) => [
    `${token.chainId}:${token.address.toLowerCase()}`,
    token,
  ]),
);

function getErc20TokenMetadata(chainId, tokenAddress) {
  if (!tokenAddress) {
    return null;
  }
  return erc20TokensByChainAndAddress.get(
    `${chainId}:${tokenAddress.toLowerCase()}`,
  );
}

function isKnownErc20Token(chainId, tokenAddress) {
  return Boolean(getErc20TokenMetadata(chainId, tokenAddress));
}

class EvmAccount {
  network = NETWORK.EVM;
  chainId = null;
  networkInfo = null;

  signer = null;
  account = null;
  provider = null;

  address = null;

  // evm account is activated as default
  activated = true;

  // wei unit
  gasPrice = 0;

  constructor(hashKey, chainId) {
    this.chainId = chainId;
    this.networkInfo = EVM_NETWORKS.find((n) => n.chainId === chainId);
    this.provider = new ethers.JsonRpcProvider(this.networkInfo.provider);

    this.signer = getEvmPrivateKey(hashKey);
    this.account = new ethers.Wallet(this.signer, this.provider);
    this.address = this.account.address;
  }

  isAddress(value) {
    return ethers.isAddress(value);
  }

  linkOfAddress(address) {
    return this.networkInfo.scanner + "/address/" + address;
  }

  linkOfContract(address) {
    return this.networkInfo.scanner + "/address/" + address + "#code";
  }

  linkOfTransaction(txn) {
    return this.networkInfo.scanner + "/tx/" + txn;
  }

  async getNetworkStatus() {
    const { gasPrice } = await this.provider.getFeeData();
    this.gasPrice = gasPrice;
  }

  async queryTokenBalances(native = false) {
    if (native) {
      return [await this.#fetchNativeBalance()];
    }

    return await this.#fetchErc20Balances();
  }

  /**
   * Price enrichment (not implemented yet).
   * @param {Array} balances
   */
  async queryPrices(balances = []) {
    return balances;
  }

  async #fetchNativeBalance() {
    const meta = this.networkInfo?.nativeToken ?? {
      symbol: "ETH",
      name: "Native",
      decimals: 18,
    };
    const rawBalance = await this.#fetchNativeRawBalance();

    return this.#formatBalance({
      address: "0x",
      name: meta.name,
      symbol: meta.symbol,
      decimals: meta.decimals,
      logoURI: this.networkInfo?.nativeLogoURI ?? "",
      rawBalance,
      native: true,
    });
  }

  async #fetchNativeRawBalance() {
    return await fetchAlchemyNativeTokenBalance(this.chainId, this.address);
  }

  async #fetchErc20Balances() {
    const tokenBalances = await fetchAlchemyErc20TokenBalances(
      this.chainId,
      this.address,
    );

    const balances = tokenBalances
      .filter((token) => {
        const tokenAddress = token.contractAddress;
        if (!tokenAddress) {
          return false;
        }

        if (
          !token.tokenBalance ||
          token.tokenBalance === "0x" ||
          BigInt(token.tokenBalance) === 0n
        ) {
          return false;
        }

        return (
          isWhitelistedToken(this.chainId, tokenAddress) ||
          isKnownErc20Token(this.chainId, tokenAddress)
        );
      })
      .map((token) => {
        const tokenAddress = token.contractAddress;
        const metadata = getErc20TokenMetadata(this.chainId, tokenAddress);

        if (!metadata) {
          return null;
        }

        return this.#formatBalance({
          address: tokenAddress,
          name: metadata.name,
          symbol: metadata.symbol,
          decimals: metadata.decimals,
          logoURI: metadata.logoURI,
          rawBalance: token.tokenBalance,
          native: false,
        });
      })
      .filter(Boolean)
      .sort((a, b) => b.balance - a.balance);

    return balances;
  }

  #formatBalance({
    address,
    name,
    symbol,
    decimals,
    logoURI,
    rawBalance,
    native,
  }) {
    const balance = parseFloat(ethers.formatUnits(rawBalance, decimals));

    return {
      chainId: this.chainId,
      address,
      name,
      symbol,
      decimals,
      logoURI,
      balance,
      rawBalance: rawBalance.toString(),
      price: 0,
      quote: 0,
      native,
    };
  }

  /**
   * Token transfer history (not implemented yet).
   *
   * Future return format — array of:
   * {
   *   hash: string,
   *   from: string,
   *   to: string,
   *   value: number,
   *   blockNum: string,
   *   blockTimestamp: string,
   * }
   */
  async queryTokenHistory(_tokenAddress, _decimals, _maxCount = 5) {
    return [];
  }

  /**
   *
   * @param {*} token contract address or null(for native currency)
   * @param {*} to
   * @param {*} value
   */
  async populateTransferToken(token, to, value) {
    if (!token) {
      return {
        to,
        value,
        data: null,
      };
    }

    const erc20 = new Contract(token, IERC20.abi, this.provider);
    const result = await erc20
      .connect(this.account)
      .transfer.populateTransaction(to, value);
    return result;
  }

  async estimateGas({ to, data, value = 0, from = this.account.address }) {
    return await this.provider.estimateGas({
      to,
      data,
      value,
      from,
    });
  }

  async execute({ to, data, value = 0, gasPrice = null, gasLimit = null }) {
    // Some RPC providers fail on "pending" nonce lookups.
    // Pre-populate nonce from "latest" to avoid ethers fallback path.
    let nonce = null;
    try {
      nonce = await this.provider.getTransactionCount(
        this.account.address,
        "latest",
      );
    } catch (_e) {
      // Keep null and let ethers resolve nonce using provider defaults.
    }

    const tx = await this.account.sendTransaction({
      to,
      value,
      data,
      gasPrice,
      gasLimit,
      nonce,
    });
    return await tx.wait();
  }
}

export default EvmAccount;
