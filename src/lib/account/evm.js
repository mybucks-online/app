import { getEvmPrivateKey } from "@mybucks.online/core";
import { tokens as defaultTokensList } from "@uniswap/default-token-list";
import { Contract, ethers } from "ethers";

import { EVM_NETWORKS, NETWORK } from "@mybucks/lib/conf";
import IERC20 from "@mybucks/lib/erc20.json";
import {
  getErc20TokenHistory,
  getNativeAndErc20TokenBalances,
} from "@mybucks/lib/moralis";

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

  async queryBalances() {
    const tokenBalances = await getNativeAndErc20TokenBalances(this.address, this.chainId);

    const balances = tokenBalances
      .filter((token) => {
        const isNative = token.native_token || false;
        if (isNative) return true;

        return defaultTokensList.find(
          ({ address }) =>
            address.toLowerCase() === token.token_address.toLowerCase()
        );
      })
      .map((token) => {
        const isNative = token.native_token || false;
        const address = isNative ? "0x" : token.token_address;
        const balance = parseFloat(token.balance_formatted || "0");
        const price = parseFloat(token.usd_price || "0");
        const quote = balance * price;

        return {
          chainId: this.chainId,
          address,
          name: token.name,
          symbol: token.symbol,
          decimals: parseInt(token.decimals),
          logoURI: token.thumbnail || token.logo,
          balance,
          rawBalance: token.balance,
          price,
          quote,
          native: isNative,
        };
      })
      .filter((t) => t.native || t.balance > 0);

    // Sort: native token first, then by balance descending
    balances.sort((a, b) => {
      if (a.native) return -1;
      if (b.native) return 1;
      return b.balance - a.balance;
    });

    return balances;

    /**
     * return format:
     *
     * array of
     *
     * chainId,
     * address
     * name
     * symbol
     * decimals
     * logoURI
     * balance
     * rawBalance
     * price
     * quote
     * native (optional)
     */
  }

  async queryTokenHistory(tokenAddress, decimals, maxCount = 5) {
    if (!tokenAddress) {
      return [];
    }

    const transfers = await getErc20TokenHistory(
      this.address,
      this.chainId,
      tokenAddress,
      maxCount
    );

    return transfers.map((transfer) => ({
      hash: transfer.transaction_hash,
      from: transfer.from_address,
      to: transfer.to_address,
      value: parseFloat(
        ethers.formatUnits(transfer.value, parseInt(transfer.token_decimals))
      ),
      blockNum: transfer.block_number.toString(),
      blockTimestamp: transfer.block_timestamp,
    }));

    /**
     * return format:
     *
     * array of
     *
     * from
     * to
     * value
     * hash
     * blockNum
     * blockTimestamp
     */
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
    const tx = await this.account.sendTransaction({
      to,
      value,
      data,
      gasPrice,
      gasLimit,
    });
    return await tx.wait();
  }
}

export default EvmAccount;
