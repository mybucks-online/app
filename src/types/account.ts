import type EvmAccount from "@mybucks/lib/account/evm";
import type TronAccount from "@mybucks/lib/account/tron";

/**
 * The active wallet account — discriminated by `.network`
 * (NETWORK.EVM -> EvmAccount, NETWORK.TRON -> TronAccount).
 * EVM and Tron pages each only ever hold their own concrete type; this
 * union exists for shared Store/UI code that doesn't care which one it is.
 */
export type Account = EvmAccount | TronAccount;
