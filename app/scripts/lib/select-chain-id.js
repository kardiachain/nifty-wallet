import {
  KARDIA_MAINNET_CHAINID,
} from '../controllers/network/enums'

const standardNetworkId = {
  '100': KARDIA_MAINNET_CHAINID,
}

function selectChainId (metamaskState) {
  const { network, provider: { chainId } } = metamaskState
  return standardNetworkId[network] || `0x${parseInt(chainId, 10).toString(16)}`
}

export default selectChainId
