import type EvmAccount from "@mybucks/lib/account/evm";
import type TronAccount from "@mybucks/lib/account/tron";
import type { NETWORK } from "@mybucks/lib/conf";
import type { TokenBalance } from "@mybucks/types/token";

/**
 * Members shared identically by EvmAccount and TronAccount. Both classes
 * `implements` this, so the compiler catches drift instead of relying on
 * convention.
 *
 * Chain-specific transaction methods (populateTransferToken, estimateGas,
 * execute) are intentionally excluded — their signatures and return shapes
 * differ by protocol (e.g. Tron gas is a [bandwidth, energy] tuple built
 * from a raw signed transaction; EVM gas is a single bigint from an
 * options object), and forcing a common shape would hurt readability more
 * than it would help.
 */
export interface AccountBase {
  readonly network: NETWORK;
  chainId: number;
  address: string;
  activated: boolean;

  isAddress(value: string): boolean;
  linkOfAddress(address: string): string;
  linkOfContract(address: string): string;
  linkOfTransaction(txn: string): string;
  getNetworkStatus(): Promise<void>;
  queryTokenBalances(native?: boolean): Promise<TokenBalance[]>;
  queryPrices(tokenAddresses?: string[]): Promise<Record<string, number>>;
  queryTokenHistory(
    tokenAddress?: string,
    decimals?: number,
    maxCount?: number,
  ): Promise<unknown[]>;
}

/**
 * The active wallet account — discriminated by `.network`
 * (NETWORK.EVM -> EvmAccount, NETWORK.TRON -> TronAccount).
 * EVM and Tron pages each only ever hold their own concrete type; this
 * union exists for shared Store/UI code that doesn't care which one it is.
 */
export type Account = EvmAccount | TronAccount;
