import { TronWeb } from "tronweb";
import { Buffer } from "buffer";
import { getEvmPrivateKey } from "@mybucks/lib/conf";

const TRC20_USDT_ADDRESS = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

class TronAccount {
  static network = "tron";

  signer = null;
  account = null;

  address = null;
  hexAddress = null;

  activated = false;
  freeBandwidth = null;
  stakedBandwidth = null;
  energyBalance = null;

  constructor(hashKey) {
    this.signer = getEvmPrivateKey(hashKey);
    this.account = new TronWeb({
      fullHost: "https://api.trongrid.io",
      headers: { "TRON-PRO-API-KEY": import.meta.env.VITE_TRONGRID_API_KEY },
      privateKey: this.signer.slice(2),
    });
    this.address = this.account.address.fromPrivateKey(this.signer.slice(2));
    this.hexAddress = this.account.address.toHex(this.address);

    // fetch bandwidth and energy balances
    this.getNetworkStatus();
  }

  isAddress(value) {
    // [TODO] confirm again
    return this.account.address.isAddress(value);
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
    if (!this.account) {
      return false;
    }
    const { balance } = await this.account.trx.getAccount(address);
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
    } = await this.account.trx.getAccountResources(this.address);

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
    const trxRawBalance = !this.activated
      ? 0
      : await this.account.trx.getBalance(this.address);
    const nativeTokenBalance = this.account.fromSun(trxRawBalance);
    // [TODO] Replace by CG API
    const nativeTokenPrice = 0.155;

    // balance of TRC20 USDT
    const usdtContract = await this.account.contract().at(TRC20_USDT_ADDRESS);
    const usdtRawBalance = !this.activated
      ? 0
      : await usdtContract.methods.balanceOf(this.address).call();
    const usdtBalance = usdtRawBalance / this.account.BigNumber("1000000");
    // [TODO] Replace by CG API
    const usdtPrice = 1.0;

    return [
      nativeTokenName,
      nativeTokenBalance,
      nativeTokenPrice,
      [
        {
          nativeToken: true,
          contractName: "TRON",
          contractTickerSymbol: "TRX",
          contractAddress: "",
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
      return await this.account.transactionBuilder.sendTrx(
        to,
        value,
        this.address
      );
    }

    const { transaction } =
      await this.account.transactionBuilder.triggerSmartContract(
        this.account.address.toHex(token),
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
    const { raw_data_hex, signature } = await this.account.trx.sign(
      unsignedTxn,
      this.account.defaultPrivateKey
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
      await this.account.transactionBuilder.triggerConstantContract(
        this.account.address.toHex(token),
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
    const signedTxn = await this.account.trx.sign(
      rawTxn,
      this.account.defaultPrivateKey
    );
    const result = await this.account.trx.sendRawTransaction(signedTxn);
    return result;
  }
}

export default TronAccount;
