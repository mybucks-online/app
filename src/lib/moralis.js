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
  // Convert chainId to hex format (e.g., 1 -> "0x1", 137 -> "0x89")
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
