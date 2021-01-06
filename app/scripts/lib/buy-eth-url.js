module.exports = {
  getBuyEthUrl,
  getFaucets,
  getExchanges,
}
const ethNetProps = require('eth-net-props')

const {
  KARDIA_MAINNET_CODE,
} = require('../controllers/network/enums')

/**
 * Gives the caller a url at which the user can acquire coin, depending on the network they are in
 *
 * @param {object} opts Options required to determine the correct url
 * @param {string} opts.network The network for which to return a url
 * @param {string} opts.amount The amount of ETH to buy on coinbase. Only relevant if network === '1'.
 * @param {string} opts.address The address the bought ETH should be sent to.  Only relevant if network === '1'.
 * @param {number} opts.ind The position of the link (to faucet, or exchange) in the array of links for selected network
 * @returns {string|undefined} The url at which the user can access ETH, while in the given network. If the passed
 * network does not match any of the specified cases, or if no network is given, returns undefined.
 *
 */
function getBuyEthUrl ({ network, amount, address, ind }) {
  let url
  switch (Number(network)) {
    case KARDIA_MAINNET_CODE:
      url = ''
      break
  }
  return url
}

/**
 * Retrieves the array of faucets for given network ID of testnet
 *
 * @param {string} The network ID
 * @returns {array} The array of faucets for given network ID
 */
function getFaucets (network) {
  return ethNetProps.faucetLinks(network)
}

/**
 * Retrieves the array of exchanges for given network ID of production chain
 *
 * @param {object} opts Options required to determine the correct exchange service url
 * @param {string} opts.network The network ID
 * @param {string} opts.amount The amount of ETH to buy on coinbase. Only relevant if network === '1'.
 * @param {string} opts.address The address the bought ETH should be sent to.  Only relevant if network === '1'.
 * @returns {array} The array of exchanges for given network ID
 */
function getExchanges ({network, amount, address}) {
  const networkID = Number(network)
  switch (networkID) {
    case KARDIA_MAINNET_CODE:
      return [
        {
          name: 'KuCoin',
          link: 'https://www.kucoin.com/',
        },
      ]
    default:
      return []
  }
}
