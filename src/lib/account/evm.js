import { CovalentClient } from "@covalenthq/client-sdk";
import { tokens as defaultTokensList } from "@uniswap/default-token-list";
import { Alchemy } from "alchemy-sdk";
import camelcaseKeys from "camelcase-keys";
import { Contract, ethers } from "ethers";

import { EVM_NETWORKS, getEvmPrivateKey, NETWORK } from "@mybucks/lib/conf";
import IERC20 from "@mybucks/lib/erc20.json";

const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY;

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

  queryClient = null;
  alchemyClient = null;

  constructor(hashKey, chainId) {
    this.chainId = chainId;
    this.networkInfo = EVM_NETWORKS.find((n) => n.chainId === chainId);
    this.provider = new ethers.JsonRpcProvider(this.networkInfo.provider);

    this.signer = getEvmPrivateKey(hashKey);
    this.account = new ethers.Wallet(this.signer, this.provider);
    this.address = this.account.address;

    this.queryClient = new CovalentClient(
      import.meta.env.VITE_COVALENT_API_KEY
    );

    this.alchemyClient = new Alchemy({
      network: this.networkInfo.networkId,
      apiKey: alchemyApiKey,
    });
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
    // get balances
    const [nativeBalance, { tokenBalances }] = await Promise.all([
      this.provider.getBalance(this.address),
      this.alchemyClient.core.getTokenBalances(this.address),
    ]);

    // get balances of native token, and erc20 tokens and merge into single array
    tokenBalances.unshift({
      contractAddress: this.networkInfo.wrappedAsset,
      tokenBalance: nativeBalance,
      native: true,
    });

    // get prices
    const response = await fetch(
      `https://api.g.alchemy.com/prices/v1/${alchemyApiKey}/tokens/by-address`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          addresses: tokenBalances.map(({ contractAddress: address }) => ({
            network: this.networkInfo.networkId,
            address,
          })),
        }),
      }
    );
    const { data: rawPrices } = await response.json();
    // converts key:value pair of address and latest price
    const prices = rawPrices
      .filter((t) => !t.error)
      .reduce(
        (acc, t) => ({ ...acc, [t.address.toLowerCase()]: t.prices[0].value }),
        {}
      );

    // find token details including name, symbol, decimals
    // and filter out not-listed tokens
    const balances = tokenBalances
      .map(({ contractAddress, tokenBalance, native }) => ({
        ...defaultTokensList.find(
          ({ address }) =>
            address.toLowerCase() === contractAddress.toLowerCase()
        ),
        rawBalance: tokenBalance,
        native,
      }))
      .filter((t) => !!t.address)
      .map((t) => ({
        ...t,
        balance: parseFloat(ethers.formatUnits(t.rawBalance, t.decimals)),
        price: parseFloat(prices[t.address.toLowerCase()]),
        quote:
          parseFloat(ethers.formatUnits(t.rawBalance, t.decimals)) *
          parseFloat(prices[t.address.toLowerCase()]),
      }));
    // remove `wrapped` for native currency
    balances[0].name = balances[0].name.split(" ")[1];
    balances[0].symbol = balances[0].symbol.slice(1);
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
