export interface NativeTokenConfig {
  symbol: string;
  name: string;
  decimals: number;
  /** Only Tron's native token carries a synthetic contract-style address. */
  address?: string;
}

export interface EvmNetworkConfig {
  chainId: number;
  name: string;
  label: string;
  nativeToken: NativeTokenConfig;
  nativeLogoURI: string;
  provider: string;
  alchemyBaseUrl: string;
  alchemyNetworkId: string;
  scanner: string;
}

export interface TronTokenConfig {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
}

export interface TronNetworkConfig {
  chainId: number;
  name: string;
  label: string;
  nativeToken: Required<NativeTokenConfig>;
  nativeLogoURI: string;
  provider: string;
  scanner: string;
  tokens: TronTokenConfig[];
}
