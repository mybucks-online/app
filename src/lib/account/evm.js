import { tokens as defaultTokensList } from "@sushiswap/default-token-list";
import { Alchemy } from "alchemy-sdk";
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

  alchemyClient = null;

  constructor(hashKey, chainId) {
    this.chainId = chainId;
    this.networkInfo = EVM_NETWORKS.find((n) => n.chainId === chainId);
    this.provider = new ethers.JsonRpcProvider(this.networkInfo.provider);

    this.signer = getEvmPrivateKey(hashKey);
    this.account = new ethers.Wallet(this.signer, this.provider);
    this.address = this.account.address;

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
    // get balances of native token, erc20 tokens and merge into single array
    // it uses wrapped asset in order to get the price of native currency
    tokenBalances.unshift({
      contractAddress: this.networkInfo.wrappedAsset,
      tokenBalance: nativeBalance,
      native: true,
    });
    // find token details including name, symbol, decimals
    // and filter out not-listed(spam) tokens
    const filteredBalances = tokenBalances
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
      }))
      .filter((t) => t.native || t.balance > 0);

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
          addresses: filteredBalances.map(({ address }) => ({
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

    const balances = filteredBalances.map((t) => ({
      ...t,
      price: parseFloat(prices[t.address.toLowerCase()]),
      quote: t.balance * parseFloat(prices[t.address.toLowerCase()]),
    }));

    // remove `wrapped` for native currency
    balances[0].address = "0x";
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

  async queryTokenHistory(tokenAddress, maxCount = 5) {
    const [{ transfers: rxTransfers }, { transfers: txTransfers }] =
      await Promise.all([
        this.alchemyClient.core.getAssetTransfers({
          category: [tokenAddress ? "erc20" : "external"],
          order: "desc",
          withMetadata: true,
          toAddress: this.address,
          excludeZeroValue: true,
          contractAddresses: tokenAddress ? [tokenAddress] : undefined,
          maxCount,
        }),
        this.alchemyClient.core.getAssetTransfers({
          category: [tokenAddress ? "erc20" : "external"],
          order: "desc",
          withMetadata: true,
          fromAddress: this.address,
          excludeZeroValue: true,
          contractAddresses: tokenAddress ? [tokenAddress] : undefined,
          maxCount,
        }),
      ]);

    const transfers = [...rxTransfers, ...txTransfers];
    transfers.sort(
      (a, b) => parseInt(b.blockNum, 16) - parseInt(a.blockNum, 16)
    );

    return transfers
      .map(
        ({
          from,
          to,
          value,
          hash,
          blockNum,
          metadata: { blockTimestamp },
        }) => ({
          hash,
          from,
          to,
          value,
          blockNum,
          blockTimestamp,
        })
      )
      .slice(0, maxCount);

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
