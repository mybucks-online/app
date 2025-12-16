const moralisApiKey = import.meta.env.VITE_MORALIS_API_KEY;

/**
 * Get token balances from Moralis
 * @param {*} address 
 * @param {*} chainId 
 * @returns 
{
  "cursor": null,
  "page": 0,
  "page_size": 25,
  "block_number": 24022198,
  "result": [
    {
      "token_address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      "symbol": "ETH",
      "name": "Ether",
      "logo": "https://cdn.moralis.io/eth/0x.png",
      "thumbnail": "https://cdn.moralis.io/eth/0x_thumb.png",
      "decimals": 18,
      "balance": "1709495362615127",
      "possible_spam": false,
      "verified_contract": true,
      "total_supply": null,
      "total_supply_formatted": null,
      "percentage_relative_to_total_supply": null,
      "security_score": 99,
      "balance_formatted": "0.001709495362615127",
      "usd_price": 3119.404732194397,
      "usd_price_24hr_percent_change": -4.698213700355726,
      "usd_price_24hr_usd_change": -146.18960167100022,
      "usd_value": 5.3326079238060045,
      "usd_value_24hr_usd_change": -0.2499104461191275,
      "native_token": true,
      "portfolio_percentage": 58.34060724013548
    },
    {
      "token_address": "0x4fabb145d64652a948d72533023f6e7a623c7c53",
      "symbol": "BUSD",
      "name": "BUSD",
      "logo": "https://logo.moralis.io/0x1_0x4fabb145d64652a948d72533023f6e7a623c7c53_05b49a8d713a42d99fc194279df539e7.png",
      "thumbnail": "https://logo.moralis.io/0x1_0x4fabb145d64652a948d72533023f6e7a623c7c53_05b49a8d713a42d99fc194279df539e7.png",
      "decimals": 18,
      "balance": "2102143890000000000",
      "possible_spam": false,
      "verified_contract": true,
      "total_supply": "55026240205945520000000000",
      "total_supply_formatted": "55026240.20594552",
      "percentage_relative_to_total_supply": 0.000003820257175726,
      "security_score": 62,
      "balance_formatted": "2.10214389",
      "usd_price": 0.9983994603822535,
      "usd_price_24hr_percent_change": 0,
      "usd_price_24hr_usd_change": 0,
      "usd_value": 2.098779325421851,
      "usd_value_24hr_usd_change": 0,
      "native_token": false,
      "portfolio_percentage": 22.961384384089797
    }
  ]
}
 */
export async function getNativeAndErc20TokenBalances(address, chainId) {
  const chainIdHex = `0x${chainId.toString(16)}`;

  const data = await fetch(
    `https://deep-index.moralis.io/api/v2.2/wallets/${address}/tokens?chain=${chainIdHex}&exclude_unverified_contracts=true`,
    {
      headers: {
        "X-API-Key": moralisApiKey,
        accept: "application/json",
      },
    }
  );
  const { result } = await data.json();
  return result || [];
}

/**
 *
 * @param {*} address
 * @param {*} chainId
 * @param {*} tokenAddress
 * @param {*} maxCount
 * @returns
{
  "page": "2",
  "page_size": "100",
  "cursor": "",
  "result": [
    {
      "token_name": "Tether USD",
      "token_symbol": "USDT",
      "token_logo": "cdn.moralis.io/325/large/Tether-logo.png?1598003707",
      "token_decimals": "6",
      "transaction_hash": "0x2d30ca6f024dbc1307ac8a1a44ca27de6f797ec22ef20627a1307243b0ab7d09",
      "address": "0x057Ec652A4F150f7FF94f089A38008f49a0DF88e",
      "block_timestamp": "2021-04-02T10:07:54.000Z",
      "block_number": 12526958,
      "block_hash": "0x0372c302e3c52e8f2e15d155e2c545e6d802e479236564af052759253b20fd86",
      "to_address_entity": "Beaver Build",
      "to_address_entity_logo": "https://beaverbuild.com/favicon.ico",
      "to_address": "0x62AED87d21Ad0F3cdE4D147Fdcc9245401Af0044",
      "to_address_label": "Binance 2",
      "from_address_entity": "Opensea",
      "from_address_entity_logo": "https://opensea.io/favicon.ico",
      "from_address": "0xd4a3BebD824189481FC45363602b83C9c7e9cbDf",
      "from_address_label": "Binance 1",
      "value": 650000000000000000,
      "transaction_index": 12,
      "log_index": 2,
      "possible_spam": "false",
      "verified_contract": "false"
    }
  ]
}
 */
export async function getErc20TokenHistory(
  address,
  chainId,
  tokenAddress,
  maxCount = 5
) {
  if (!tokenAddress) {
    return [];
  }
  const chainIdHex = `0x${chainId.toString(16)}`;

  const data = await fetch(
    `https://deep-index.moralis.io/api/v2.2/${address}/erc20/transfers?chain=${chainIdHex}&contract_addresses%5B0%5D=${tokenAddress}&limit=${maxCount}&order=DESC`,
    {
      headers: {
        "X-API-Key": moralisApiKey,
        accept: "application/json",
      },
    }
  );
  const { result } = await data.json();
  return result || [];
}
