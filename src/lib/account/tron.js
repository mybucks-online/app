import { Buffer } from "buffer";
import { TronWeb } from "tronweb";

import { getEvmPrivateKey, NETWORK } from "@mybucks/lib/conf";
import { queryPrice } from "@mybucks/lib/utils";

const TRC20_USDT_ADDRESS = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

class TronAccount {
  network = NETWORK.TRON;
  chainId = null;

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
    this.signer = getEvmPrivateKey(hashKey);
    this.tronweb = new TronWeb({
      fullHost: "https://api.trongrid.io",
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
    return "https://tronscan.org/#/address/" + address;
  }

  linkOfContract(address) {
    return "https://tronscan.org/#/token20/" + address;
  }

  linkOfTransaction(txn) {
    return "https://tronscan.org/#/transaction/" + txn;
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

  // [TODO] Now it only returns balance of TRX and USDT
  async queryBalances() {
    const nativeTokenName = "TRX";
    // get TRX balance
    const trxRawBalance = await this.tronweb.trx.getBalance(this.address);
    const nativeTokenBalance = this.tronweb.fromSun(trxRawBalance);
    const nativeTokenPrice = await queryPrice(nativeTokenName);

    // balance of TRC20 USDT
    const usdtContract = await this.tronweb.contract().at(TRC20_USDT_ADDRESS);
    const usdtRawBalance = await usdtContract.methods
      .balanceOf(this.address)
      .call();
    const usdtBalance = this.tronweb.fromSun(usdtRawBalance);
    const usdtPrice = await queryPrice("USDT");

    return [
      nativeTokenName,
      nativeTokenBalance,
      nativeTokenPrice,
      [
        {
          nativeToken: true,
          contractName: "TRON",
          contractTickerSymbol: "TRX",
          contractAddress: "41eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          contractDecimals: 6,
          balance: trxRawBalance,
          quote: nativeTokenBalance * nativeTokenPrice,
          logoURI:
            "https://assets.coingecko.com/coins/images/1094/standard/tron-logo.png?1696502193",
        },
        {
          nativeToken: false,
          contractName: "Tether USD",
          contractTickerSymbol: "USDT",
          contractAddress: TRC20_USDT_ADDRESS,
          contractDecimals: 6,
          balance: usdtRawBalance,
          quote: usdtBalance * usdtPrice,
          logoURI:
            "https://assets.coingecko.com/coins/images/325/standard/Tether.png",
        },
      ],
    ];
  }

  // [TODO] Not implemented yet
  async queryTokenHistory(contractAddress) {
    /**
     * Return the array of following properties:
     * txnHash
     * transferType
     * fromAddress
     * toAddress
     * amount
     * decimals
     * time
     */
    return [];
  }

  async populateTransferToken(token, to, value) {
    if (!token) {
      return await this.tronweb.transactionBuilder.sendTrx(
        to,
        value,
        this.address
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
        this.hexAddress
      );
    return transaction;
  }

  // it returns estimated consumption of [bandwidth, energy]
  async estimateGas(token, to, value) {
    const unsignedTxn = await this.populateTransferToken(token, to, value);
    const { raw_data_hex, signature } = await this.tronweb.trx.sign(
      unsignedTxn,
      this.tronweb.defaultPrivateKey
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
        this.hexAddress
      );

    return [bandwidth, energy_used];
  }

  async execute(rawTxn) {
    const signedTxn = await this.tronweb.trx.sign(
      rawTxn,
      this.tronweb.defaultPrivateKey
    );
    const result = await this.tronweb.trx.sendRawTransaction(signedTxn);
    return result;
  }

  async getTransactionInfo(txid) {
    return this.tronweb.trx.getTransactionInfo(txid);
  }
}

export default TronAccount;
