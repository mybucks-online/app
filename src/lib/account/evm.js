import { ethers, Contract } from "ethers";
import { CovalentClient } from "@covalenthq/client-sdk";
import camelcaseKeys from "camelcase-keys";
import { tokens as defaultTokensList } from "@sushiswap/default-token-list";

import { NETWORK, EVM_NETWORKS, getEvmPrivateKey } from "@mybucks/lib/conf";
import IERC20 from "@mybucks/lib/erc20.json";

class EvmAccount {
  network = NETWORK.EVM;
  chainId = null;

  signer = null;
  account = null;
  provider = null;

  address = null;

  activated = true;

  // wei unit
  gasPrice = 0;

  queryClient = null;

  constructor(hashKey, chainId) {
    this.chainId = chainId;
    this.provider = new ethers.JsonRpcProvider(EVM_NETWORKS[chainId].provider);

    this.signer = getEvmPrivateKey(hashKey);
    this.account = new ethers.Wallet(this.signer, this.provider);
    this.address = this.account.address;

    this.queryClient = new CovalentClient(
      import.meta.env.VITE_COVALENT_API_KEY
    );
  }

  isAddress(value) {
    return ethers.isAddress(value);
  }

  linkOfAddress(address) {
    return EVM_NETWORKS[this.chainId].scanner + "/address/" + address;
  }

  linkOfContract(address) {
    return EVM_NETWORKS[this.chainId].scanner + "/address/" + address + "#code";
  }

  linkOfTransaction(txn) {
    return EVM_NETWORKS[this.chainId].scanner + "/tx/" + txn;
  }

  async getNetworkStatus() {
    const { gasPrice } = await this.provider.getFeeData();
    this.gasPrice = gasPrice;
  }

  async queryBalances() {
    try {
      const { data, error } =
        await this.queryClient.BalanceService.getTokenBalancesForWalletAddress(
          this.chainId,
          this.account.address
        );
      if (error) {
        throw new Error("invalid balances");
      }
      const tokens = camelcaseKeys(data.items, { deep: true });

      const nativeTokenName = tokens.find(
        (t) => !!t.nativeToken
      ).contractTickerSymbol;
      const nativeTokenBalance = ethers.formatUnits(
        tokens.find((t) => !!t.nativeToken).balance,
        18
      );
      const nativeTokenPrice = tokens.find((t) => !!t.nativeToken).quoteRate;
      const balances = tokens
        .filter(
          (token) => token.balance.toString() !== "0" || token.nativeToken
        )
        .map((token) => ({
          ...token,
          logoURI: defaultTokensList.find((t) =>
            token.nativeToken
              ? t.name === token.contractName
              : t.address.toLowerCase() === token.contractAddress.toLowerCase()
          )?.logoURI,
        }));

      /**
       * token attributes:
       *
       *    nativeToken
       *    contractName
       *    contractTickerSymbol
       *    contractAddress
       *    contractDecimals
       *    balance
       *    quote
       *    logoURI
       */

      return [nativeTokenName, nativeTokenBalance, nativeTokenPrice, balances];
    } catch (e) {
      console.error("failed to fetch balances ...");
      return null;
    }
  }

  async queryTokenHistory(contractAddress) {
    try {
      const { data, error } =
        await this.queryClient.BalanceService.getErc20TransfersForWalletAddressByPage(
          this.chainId,
          this.account.address,
          {
            contractAddress,
            pageNumber: 0,
            pageSize: 5,
          }
        );
      if (error) {
        throw new Error("invalid history");
      }

      const items = camelcaseKeys(data.items, { deep: true });
      return items
        .map(({ transfers }) =>
          transfers.map((item) => ({
            txnHash: item.txHash,
            transferType: item.transferType,
            fromAddress: item.fromAddress,
            toAddress: item.toAddress,
            amount: item.delta,
            decimals: item.contractDecimals,
            time: item.blockSignedAt,
          }))
        )
        .flat();
    } catch (e) {
      console.error("failed to fetch token history ...");
      return null;
    }
  }

  /*
  async nativeCurrency() {
    const balance = await this.provider.getBalance(this.address);
    return ethers.formatEther(balance);
  }

  async balanceOfErc20(token) {
    const erc20 = new Contract(token, IERC20.abi, this.provider);
    const result = await erc20.balanceOf(this.account.address);
    return result;
  }

  async transferErc20(token, to, amount, gasPrice = null, gasLimit = null) {
    const erc20 = new Contract(token, IERC20.abi, this.provider);
    const tx = await erc20.connect(this.account).transfer(to, amount);
    await tx.wait();
  }
*/

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
