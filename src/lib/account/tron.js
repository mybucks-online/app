import { getEvmPrivateKey } from "@mybucks.online/core";
import { Buffer } from "buffer";
import { TronWeb } from "tronweb";

import { NETWORK, TRON_NETWORK } from "@mybucks/lib/conf";

class TronAccount {
  network = NETWORK.TRON;
  chainId = null;
  networkInfo = null;

  signer = null;
  tronweb = null;

  address = null;
  // tron specific
  hexAddress = null;

  // tron account is not activated as default
  activated = false;

  // tron specific
  freeBandwidth = 0;
  stakedBandwidth = 0;
  energyBalance = 0;

  constructor(hashKey) {
    this.chainId = TRON_NETWORK.chainId;
    this.networkInfo = TRON_NETWORK;

    this.signer = getEvmPrivateKey(hashKey);
    this.tronweb = new TronWeb({
      fullHost: this.networkInfo.provider,
      headers: { "TRON-PRO-API-KEY": import.meta.env.VITE_TRONGRID_API_KEY },
      privateKey: this.signer.slice(2),
    });
    this.address = this.tronweb.address.fromPrivateKey(this.signer.slice(2));
    this.hexAddress = this.tronweb.address.toHex(this.address);

    this.getNetworkStatus();
  }

  isAddress(value) {
    return this.tronweb.isAddress(value);
  }

  linkOfAddress(address) {
    return this.networkInfo.scanner + "/#/address/" + address;
  }

  linkOfContract(address) {
    return this.networkInfo.scanner + "/#/token20/" + address;
  }

  linkOfTransaction(txn) {
    return this.networkInfo.scanner + "/#/transaction/" + txn;
  }

  async isActivated(address) {
    if (!this.tronweb) {
      return false;
    }
    const { balance } = await this.tronweb.trx.getAccount(address);
    return !!balance;
  }

  async getNetworkStatus() {
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

  async queryTokenBalances(native = false) {
    if (native) {
      return [await this.#fetchNativeBalance()];
    }

    return await this.#fetchTrc20Balances();
  }

  async #fetchNativeBalance() {
    const { nativeToken, nativeLogoURI } = this.networkInfo;
    const rawBalance = await this.tronweb.trx.getBalance(this.address);
    const balance = parseFloat(this.tronweb.fromSun(rawBalance));

    return {
      native: true,
      name: nativeToken.name,
      symbol: nativeToken.symbol,
      address: nativeToken.address,
      decimals: nativeToken.decimals,
      balance,
      rawBalance: rawBalance.toString(),
      price: 0,
      quote: 0,
      logoURI: nativeLogoURI,
    };
  }

  async #fetchTrc20Balances() {
    const balances = [];

    for (const token of this.networkInfo.tokens) {
      const contract = await this.tronweb.contract().at(token.address);
      const rawBalance = await contract.methods.balanceOf(this.address).call();
      const balance = parseFloat(this.tronweb.fromSun(rawBalance));

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
        price: 0,
        quote: 0,
        logoURI: token.logoURI,
      });
    }

    return balances;
  }

  /**
   * Step 3 of balance refresh — price enrichment (not implemented yet).
   * @param {Array} balances
   */
  async queryPrices(balances = []) {
    return balances;
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
  async queryTokenHistory(_contractAddress) {
    return [];
  }

  async populateTransferToken(token, to, value) {
    if (!token) {
      return await this.tronweb.transactionBuilder.sendTrx(
        to,
        value,
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

  // it returns estimated consumption of [bandwidth, energy]
  async estimateGas(token, to, value) {
    const unsignedTxn = await this.populateTransferToken(token, to, value);
    const { raw_data_hex, signature } = await this.tronweb.trx.sign(
      unsignedTxn,
      this.tronweb.defaultPrivateKey,
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

    return [bandwidth, energy_used];
  }

  async execute(rawTxn) {
    const signedTxn = await this.tronweb.trx.sign(
      rawTxn,
      this.tronweb.defaultPrivateKey,
    );
    const result = await this.tronweb.trx.sendRawTransaction(signedTxn);
    return result;
  }

  async getTransactionInfo(txid) {
    return this.tronweb.trx.getTransactionInfo(txid);
  }
}

export default TronAccount;
