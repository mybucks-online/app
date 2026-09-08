import { getEvmPrivateKey } from "@mybucks.online/core";
import { Buffer } from "buffer";
import { TronWeb, type Types } from "tronweb";

import { NETWORK, TRON_NETWORK } from "@mybucks/lib/conf";
import type { AccountBase } from "@mybucks/types/account";
import type { TronNetworkConfig } from "@mybucks/types/network";
import type { TokenBalance } from "@mybucks/types/token";

class TronAccount implements AccountBase {
  readonly network = NETWORK.TRON;
  chainId: number;
  networkInfo: TronNetworkConfig;

  signer: string;
  tronweb: TronWeb;

  address: string;
  // tron specific
  hexAddress: string;

  // tron account is not activated as default
  activated = false;

  // tron specific
  freeBandwidth = 0;
  stakedBandwidth = 0;
  energyBalance = 0;

  constructor(hashKey: string) {
    this.chainId = TRON_NETWORK.chainId;
    this.networkInfo = TRON_NETWORK;

    this.signer = getEvmPrivateKey(hashKey);
    this.tronweb = new TronWeb({
      fullHost: this.networkInfo.provider,
      headers: { "TRON-PRO-API-KEY": import.meta.env.VITE_TRONGRID_API_KEY },
      privateKey: this.signer.slice(2),
    });
    this.address = this.tronweb.address.fromPrivateKey(
      this.signer.slice(2),
    ) as string;
    this.hexAddress = this.tronweb.address.toHex(this.address);

    this.getNetworkStatus();
  }

  isAddress(value: string): boolean {
    return this.tronweb.isAddress(value);
  }

  linkOfAddress(address: string): string {
    return this.networkInfo.scanner + "/#/address/" + address;
  }

  linkOfContract(address: string): string {
    return this.networkInfo.scanner + "/#/token20/" + address;
  }

  linkOfTransaction(txn: string): string {
    return this.networkInfo.scanner + "/#/transaction/" + txn;
  }

  async isActivated(address: string): Promise<boolean> {
    if (!this.tronweb) {
      return false;
    }
    const { balance } = await this.tronweb.trx.getAccount(address);
    return !!balance;
  }

  async getNetworkStatus(): Promise<void> {
    if (!this.activated) {
      this.activated = await this.isActivated(this.address);
      if (!this.activated) {
        return;
      }
    }

    const {
      freeNetLimit: freeBandwidthLimit,
      freeNetUsed: freeBandwidthUsed,
      NetLimit,
      NetUsed,
      EnergyLimit,
      EnergyUsed,
    } = await this.tronweb.trx.getAccountResources(this.address);

    this.freeBandwidth = (freeBandwidthLimit || 0) - (freeBandwidthUsed || 0);
    this.stakedBandwidth = (NetLimit || 0) - (NetUsed || 0);
    // energy is only obtained by staking TRX, not free
    this.energyBalance = (EnergyLimit || 0) - (EnergyUsed || 0);

    // [TODO] get staked TRX balance
  }

  async queryTokenBalances(native = false): Promise<TokenBalance[]> {
    if (native) {
      return [await this.#fetchNativeBalance()];
    }

    return await this.#fetchTrc20Balances();
  }

  async #fetchNativeBalance(): Promise<TokenBalance> {
    const { nativeToken, nativeLogoURI } = this.networkInfo;
    const rawBalance = await this.tronweb.trx.getBalance(this.address);
    const balance = parseFloat(this.tronweb.fromSun(rawBalance) as string);

    return {
      native: true,
      name: nativeToken.name,
      symbol: nativeToken.symbol,
      address: nativeToken.address,
      decimals: nativeToken.decimals,
      balance,
      rawBalance: rawBalance.toString(),
      logoURI: nativeLogoURI,
    };
  }

  async #fetchTrc20Balances(): Promise<TokenBalance[]> {
    const balances: TokenBalance[] = [];

    for (const token of this.networkInfo.tokens) {
      const contract = await this.tronweb.contract().at(token.address);
      const rawBalance = await contract.methods.balanceOf(this.address).call();
      const balance = parseFloat(this.tronweb.fromSun(rawBalance) as string);

      if (balance <= 0) {
        continue;
      }

      balances.push({
        native: false,
        name: token.name,
        symbol: token.symbol,
        address: token.address,
        decimals: token.decimals,
        balance,
        rawBalance: rawBalance.toString(),
        logoURI: token.logoURI,
      });
    }

    return balances;
  }

  /**
   * Tron prices come from Store symbol cache (TRX, USDT) — no address API.
   */
  async queryPrices(
    _tokenAddresses: string[] = [],
  ): Promise<Record<string, number>> {
    return {};
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
  async queryTokenHistory(_contractAddress?: string): Promise<unknown[]> {
    return [];
  }

  async populateTransferToken(
    token: string,
    to: string,
    value: bigint | number,
  ): Promise<Types.Transaction<Types.ContractParamter>> {
    if (!token) {
      return await this.tronweb.transactionBuilder.sendTrx(
        to,
        value as number,
        this.address,
      );
    }

    const { transaction } =
      await this.tronweb.transactionBuilder.triggerSmartContract(
        this.tronweb.address.toHex(token),
        "transfer(address,uint256)",
        {
          feeLimit: 100_000_000,
          callValue: 0,
        },
        [
          { type: "address", value: to },
          { type: "uint256", value },
        ],
        this.hexAddress,
      );
    return transaction;
  }

  /** Returns estimated consumption of [bandwidth, energy]. */
  async estimateGas(
    token: string,
    to: string,
    value: bigint | number,
  ): Promise<[number, number]> {
    const unsignedTxn = await this.populateTransferToken(token, to, value);
    const { raw_data_hex, signature } = await this.tronweb.trx.sign(
      unsignedTxn,
      this.tronweb.defaultPrivateKey as string,
    );
    const bandwidth =
      9 +
      60 +
      Buffer.from(raw_data_hex, "hex").byteLength +
      Buffer.from(signature[0], "hex").byteLength;

    if (!token) {
      // TRX transfer consumes only bandwidth, no energy
      return [bandwidth, 0];
    }

    // estimate energy for TRC20 transfer
    const { energy_used } =
      await this.tronweb.transactionBuilder.triggerConstantContract(
        this.tronweb.address.toHex(token),
        "transfer(address,uint256)",
        {},
        [
          { type: "address", value: to },
          { type: "uint256", value },
        ],
        this.hexAddress,
      );

    return [bandwidth, energy_used ?? 0];
  }

  async execute(rawTxn: Types.Transaction<Types.ContractParamter>) {
    const signedTxn = await this.tronweb.trx.sign(
      rawTxn,
      this.tronweb.defaultPrivateKey as string,
    );
    const result = await this.tronweb.trx.sendRawTransaction(signedTxn);
    return result;
  }

  async getTransactionInfo(txid: string) {
    return this.tronweb.trx.getTransactionInfo(txid);
  }
}

export default TronAccount;
