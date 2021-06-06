const { networkIDs } = require('./enum')
const {
	MAINNET_CODE,
	ROPSTEN_CODE,
	RINKEBY_CODE,
	GOERLI_CODE,
	KOVAN_CODE,
	SOKOL_CODE,
	POA_CORE_CODE,
	XDAI_CODE,
	RSK_CODE,
	RSK_TESTNET_CODE,
	CLASSIC_CODE,
	KARDIA_CODE
} = networkIDs

const blockScoutLink = (net, prefix) => `https://blockscout.com/${net}/${prefix}`
const etherscanLink = (prefix) => prefix === 'mainnet' ? 'https://etherscan.io' : `https://${prefix}.etherscan.io`
const rskTestnetExplorerLink = 'https://explorer.testnet.rsk.co'

const explorerLink = (networkCode, net, prefix) => {
	switch (networkCode) {
	case SOKOL_CODE: // POA Sokol testnet
	case POA_CORE_CODE: // POA Core
	case XDAI_CODE: // xDai chain
	case CLASSIC_CODE: // ETC mainnet
	case RSK_CODE: // RSK mainnet
		return blockScoutLink(net, prefix)
	case RSK_TESTNET_CODE: // RSK testnet
		return rskTestnetExplorerLink
	case MAINNET_CODE: // main net
	case ROPSTEN_CODE: // ropsten testnet
	case RINKEBY_CODE: // rinkeby testnet
	case KOVAN_CODE: // kovan testnet
	case GOERLI_CODE: // Goerli testnet
		return etherscanLink(prefix)
	case KARDIA_CODE:
		return 'https://explorer.kardiachain.io'
	default:
		return blockScoutLink(net, prefix)
	}
}

const tokenLink = (networkCode, chain, prefix, tokenAddress, holderAddress) => {
	const blockscoutLinkStr = `${blockScoutLink(chain, prefix)}/address/${holderAddress}/tokens/${tokenAddress}/token-transfers`
	const etherscanLinkStr = `${etherscanLink(prefix)}/token/${tokenAddress}?a=${holderAddress}`
	const rskTestnetExplorerLinkStr = `${rskTestnetExplorerLink}/address/${tokenAddress}`
	switch (networkCode) {
	case SOKOL_CODE: // POA Sokol testnet
	case POA_CORE_CODE: // POA Core
	case XDAI_CODE: // xDai chain
	case CLASSIC_CODE: // ETC mainnet
	case RSK_CODE: // RSK mainnet
		return blockscoutLinkStr
	case RSK_TESTNET_CODE: // RSK testnet
		return rskTestnetExplorerLinkStr
	case MAINNET_CODE: // main net
	case ROPSTEN_CODE: // ropsten testnet
	case RINKEBY_CODE: // rinkeby testnet
	case KOVAN_CODE: // kovan testnet
	case GOERLI_CODE: // Goerli testnet
		return etherscanLinkStr
	default:
		return blockscoutLinkStr
	}
}

const getExplorerAccountLinkFor = (account, networkCode) => {
	const prefix = getExplorerPrefix(networkCode)
	const chain = getExplorerChain(networkCode)
	return `${explorerLink(networkCode, chain, prefix)}/address/${account}`
}

const getExplorerTxLinkFor = (hash, networkCode) => {
	const prefix = getExplorerPrefix(networkCode)
	const chain = getExplorerChain(networkCode)
	return `${explorerLink(networkCode, chain, prefix)}/tx/${hash}`
}

const getExplorerTokenLinkFor = (tokenAddress, holderAddress, networkCode) => {
	const prefix = getExplorerPrefix(networkCode)
	const chain = getExplorerChain(networkCode)
	return tokenLink(networkCode, chain, prefix, tokenAddress, holderAddress)
}

function getExplorerChain (networkCode) {
	const net = parseInt(networkCode)
	let chain
	switch (net) {
	case MAINNET_CODE: // main net
	case ROPSTEN_CODE: // ropsten testnet
	case RINKEBY_CODE: // rinkeby testnet
	case KOVAN_CODE: // kovan testnet
	case GOERLI_CODE: // Goerli testnet
		chain = 'eth'
		break
	case SOKOL_CODE: // POA Sokol testnet
	case POA_CORE_CODE: // POA Core
	case XDAI_CODE: // xDai chain
		chain = 'poa'
		break
	case CLASSIC_CODE: // ETC mainnet
		chain = 'etc'
		break
	case RSK_CODE: // RSK mainnet
		chain = 'rsk'
		break
	default:
		chain = ''
	}
	return chain
}

function getExplorerPrefix (networkCode) {
	const net = parseInt(networkCode)
	let prefix
	switch (net) {
	case MAINNET_CODE: // main net
	case CLASSIC_CODE: // ETC mainnet
	case RSK_CODE: // RSK mainnet
		prefix = 'mainnet'
		break
	case ROPSTEN_CODE: // ropsten testnet
		prefix = 'ropsten'
		break
	case RINKEBY_CODE: // rinkeby testnet
		prefix = 'rinkeby'
		break
	case KOVAN_CODE: // kovan testnet
		prefix = 'kovan'
		break
	case SOKOL_CODE: // POA Sokol testnet
		prefix = 'sokol'
		break
	case POA_CORE_CODE: // POA Core
		prefix = 'core'
		break
	case XDAI_CODE: // xDai chain
		prefix = 'xdai'
		break
	case GOERLI_CODE: // Goerli testnet
		prefix = 'goerli'
		break
	default:
		prefix = ''
	}
	return prefix
}

module.exports = {
	getExplorerAccountLinkFor,
	getExplorerTxLinkFor,
	getExplorerTokenLinkFor,
}
