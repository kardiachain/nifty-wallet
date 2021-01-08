const LOCALHOST = 'localhost'
const RPC = 'rpc'
const KARDIA_MAINNET = 'kardia_mainnet'
// const KARDIA_TESTNET = 'kardia_testnet'

const KAI_TICK = 'KAI'

// TODO: Update constant
const KARDIA_MAINNET_CHAINID = '0'
// const KARDIA_TESTNET_CHAINID = '0x1000'

const KARDIA_MAINNET_CODE = 100
// const KARDIA_TESTNET_CODE = 1000

const KARDIA_MAINNET_NETWORK_ID = '100'
// const KARDIA_TESTNET_NETWORK_ID = '1000'

const RPC_NETWORK_ID = RPC

const NETWORK_TYPE_TO_ID_MAP = {
  [KARDIA_MAINNET]: { networkId: KARDIA_MAINNET_NETWORK_ID, chainId: KARDIA_MAINNET_CHAINID },
  // [KARDIA_TESTNET]: { networkId: KARDIA_TESTNET_NETWORK_ID, chainId: KARDIA_TESTNET_CHAINID },
  [RPC]: { networkId: RPC_NETWORK_ID, chainId: '0x0' },
}

const KARDIA_MAINNET_DISPLAY_NAME = 'Aris Mainnet 1.0'
// const KARDIA_TESTNET_DISPLAY_NAME = 'Kardia Testnet'

const DROPDOWN_KARDIA_MAINNET_DISPLAY_NAME = KARDIA_MAINNET_DISPLAY_NAME
// const DROPDOWN_KARDIA_TESTNET_DISPLAY_NAME = KARDIA_TESTNET_DISPLAY_NAME

const chainTypes = {
  TEST: 1,
  PROD: 2,
}


function getNetworkDisplayName (network) {
	const netID = parseInt(network)
	switch (netID) {
    case KARDIA_MAINNET_CODE:
      return 'Mainnet Aris 1.0'
    default:
      return 'Unknown Private Network'
	}
}

function getNetworkCoinName (network) {
	const netID = parseInt(network)
	switch (netID) {
	case KARDIA_MAINNET_CODE:
		return 'KAI'
	default:
		return 'KAI'
	}
}

module.exports = {
  LOCALHOST,
  RPC,
  chainTypes,
  NETWORK_TYPE_TO_ID_MAP,
  KARDIA_MAINNET_CODE,
  KARDIA_MAINNET,
  KARDIA_MAINNET_DISPLAY_NAME,
  DROPDOWN_KARDIA_MAINNET_DISPLAY_NAME,
  KAI_TICK,
  KARDIA_MAINNET_CHAINID,
  getNetworkDisplayName,
  getNetworkCoinName,
  // KARDIA_TESTNET,
  // KARDIA_TESTNET_CODE,
  // KARDIA_TESTNET_DISPLAY_NAME,
  // DROPDOWN_KARDIA_TESTNET_DISPLAY_NAME,
}
