import TronWeb from "tronweb";
import { getEvmPrivateKey } from "../conf";

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

    if (!this.activated) {
      this.activated = await this.isActivated(this.address);
    }
  }

  // [TODO] Now it only returns balance of TRX and USDT
  async queryBalances() {
    const nativeTokenName = "TRX";
    const trxRawBalance = await this.account.trx.getBalance(this.address);
    const nativeTokenBalance = this.account.fromSun(trxRawBalance);
    // [TODO] Replace by CG API
    const nativeTokenPrice = 0.155;

    // balance of TRC20 USDT
    const usdtContract = await this.account.contract().at(TRC20_USDT_ADDRESS);
    const usdtRawBalance = await usdtContract.methods
      .balanceOf(this.address)
      .call();
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
          balance: trxBalance,
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
          { type: "uint256", value: value },
        ],
        this.hexAddress
      );
    return transaction;
  }

  async estimateGas() {}

  async execute() {}
}

export default TronAccount;
