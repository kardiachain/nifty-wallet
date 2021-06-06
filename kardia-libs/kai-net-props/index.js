const getExplorerLinks = require('./helpers/get-explorer-links')
const faucetLinks = require('./helpers/get-faucet-links')
const RPCEndpoints = require('./helpers/get-rpc-endpoints')
const getNetProperties = require('./helpers/get-net-properties')

module.exports = {
	explorerLinks: {
		getExplorerAccountLinkFor: getExplorerLinks.getExplorerAccountLinkFor,
		getExplorerTxLinkFor: getExplorerLinks.getExplorerTxLinkFor,
		getExplorerTokenLinkFor: getExplorerLinks.getExplorerTokenLinkFor,
	},
	faucetLinks: faucetLinks.getFaucetLinks,
	RPCEndpoints: RPCEndpoints.getRPCEndpoints,
	props: {
		getNetworkDisplayName: getNetProperties.getNetworkDisplayName,
		getNetworkCoinName: getNetProperties.getNetworkCoinName,
		isTestnet: getNetProperties.isTestnet,
	}
}