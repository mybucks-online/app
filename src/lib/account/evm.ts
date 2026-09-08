import { getEvmPrivateKey } from "@mybucks.online/core";
import { tokens as defaultTokensList } from "@uniswap/default-token-list";
import { Contract, ethers } from "ethers";

import { EVM_NETWORKS, NETWORK } from "@mybucks/lib/conf";
import {
  fetchErc20TokenBalances,
  fetchNativeTokenBalance,
  fetchTokenPricesByAddress,
} from "@mybucks/lib/providers/alchemy";
import { isWhitelistedToken } from "@mybucks/lib/whitelists";
import type { AccountBase } from "@mybucks/types/account";
import type { EvmNetworkConfig } from "@mybucks/types/network";
import type { TokenBalance } from "@mybucks/types/token";

import IERC20 from "./erc20.json";

interface Erc20TokenListEntry {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
}

const erc20TokensByChainAndAddress = new Map<string, Erc20TokenListEntry>(
  (defaultTokensList as Erc20TokenListEntry[]).map((token) => [
    `${token.chainId}:${token.address.toLowerCase()}`,
    token,
  ]),
);

function getErc20TokenMetadata(
  chainId: number,
  tokenAddress?: string | null,
): Erc20TokenListEntry | null {
  if (!tokenAddress) {
    return null;
  }
  return (
    erc20TokensByChainAndAddress.get(
      `${chainId}:${tokenAddress.toLowerCase()}`,
    ) ?? null
  );
}

function isKnownErc20Token(
  chainId: number,
  tokenAddress?: string | null,
): boolean {
  return Boolean(getErc20TokenMetadata(chainId, tokenAddress));
}

interface FormatBalanceInput {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  rawBalance: bigint | string;
  native: boolean;
}

interface TransferPopulateResult {
  to: string;
  value: bigint;
  data: null;
}

interface EstimateGasParams {
  to: string;
  data?: string | null;
  value?: bigint | number;
  from?: string;
}

interface ExecuteParams {
  to: string;
  data?: string | null;
  value?: bigint | number;
  gasPrice?: bigint | null;
  gasLimit?: bigint | null;
}

class EvmAccount implements AccountBase {
  readonly network = NETWORK.EVM;
  chainId: number;
  networkInfo: EvmNetworkConfig;

  signer: string;
  account: ethers.Wallet;
  provider: ethers.JsonRpcProvider;

  address: string;

  // evm account is activated as default
  activated = true;

  // wei unit
  gasPrice: bigint = 0n;

  constructor(hashKey: string, chainId: number) {
    this.chainId = chainId;
    this.networkInfo = EVM_NETWORKS.find((n) => n.chainId === chainId)!;
    this.provider = new ethers.JsonRpcProvider(this.networkInfo.provider);

    this.signer = getEvmPrivateKey(hashKey);
    this.account = new ethers.Wallet(this.signer, this.provider);
    this.address = this.account.address;
  }

  isAddress(value: string): boolean {
    return ethers.isAddress(value);
  }

  linkOfAddress(address: string): string {
    return this.networkInfo.scanner + "/address/" + address;
  }

  linkOfContract(address: string): string {
    return this.networkInfo.scanner + "/address/" + address + "#code";
  }

  linkOfTransaction(txn: string): string {
    return this.networkInfo.scanner + "/tx/" + txn;
  }

  async getNetworkStatus(): Promise<void> {
    const { gasPrice } = await this.provider.getFeeData();
    this.gasPrice = gasPrice ?? 0n;
  }

  async queryTokenBalances(native = false): Promise<TokenBalance[]> {
    if (native) {
      return [await this.#fetchNativeBalance()];
    }

    return await this.#fetchErc20Balances();
  }

  /** USD prices for ERC-20 contract addresses on this chain. Returns lowercase address -> USD price. */
  async queryPrices(
    tokenAddresses: string[] = [],
  ): Promise<Record<string, number>> {
    const addresses = [
      ...new Set(
        tokenAddresses.filter(Boolean).map((address) => address.toLowerCase()),
      ),
    ];
    if (!addresses.length) {
      return {};
    }

    const network = this.networkInfo?.alchemyNetworkId;
    if (!network) {
      return {};
    }

    return await fetchTokenPricesByAddress(network, addresses);
  }

  async #fetchNativeBalance(): Promise<TokenBalance> {
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

  async #fetchNativeRawBalance(): Promise<string> {
    return await fetchNativeTokenBalance(this.chainId, this.address);
  }

  async #fetchErc20Balances(): Promise<TokenBalance[]> {
    const tokenBalances = await fetchErc20TokenBalances(
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
      .map((token): TokenBalance | null => {
        const tokenAddress = token.contractAddress!;
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
          rawBalance: token.tokenBalance!,
          native: false,
        });
      })
      .filter((b): b is TokenBalance => b !== null)
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
  }: FormatBalanceInput): TokenBalance {
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
  async queryTokenHistory(
    _tokenAddress?: string,
    _decimals?: number,
    _maxCount = 5,
  ): Promise<unknown[]> {
    return [];
  }

  /** @param token contract address, or "" for native currency */
  async populateTransferToken(token: string, to: string, value: bigint) {
    if (!token) {
      const result: TransferPopulateResult = { to, value, data: null };
      return result;
    }

    const erc20 = new Contract(token, IERC20.abi, this.provider);
    const result = await erc20
      .connect(this.account)
      .getFunction("transfer")
      .populateTransaction(to, value);
    return result;
  }

  async estimateGas({
    to,
    data,
    value = 0,
    from = this.account.address,
  }: EstimateGasParams): Promise<bigint> {
    return await this.provider.estimateGas({
      to,
      data,
      value,
      from,
    });
  }

  async execute({
    to,
    data,
    value = 0,
    gasPrice = null,
    gasLimit = null,
  }: ExecuteParams): Promise<ethers.TransactionReceipt | null> {
    // Some RPC providers fail on "pending" nonce lookups.
    // Pre-populate nonce from "latest" to avoid ethers fallback path.
    let nonce: number | null = null;
    try {
      nonce = await this.provider.getTransactionCount(
        this.account.address,
        "latest",
      );
    } catch {
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
