const {
  // KARDIA_TESTNET,
  // KARDIA_TESTNET_CODE,
  // KARDIA_TESTNET_DISPLAY_NAME,
  // DROPDOWN_KARDIA_TESTNET_DISPLAY_NAME,
  KARDIA_MAINNET_CODE,
  KARDIA_MAINNET,
  KARDIA_MAINNET_DISPLAY_NAME,
  DROPDOWN_KARDIA_MAINNET_DISPLAY_NAME,
  chainTypes,
} = require('./enums')

const { PROD } = chainTypes
const networks = {}

const KARDIA_MAINNET_OBJ = {
  order: 1,
  chainType: PROD,
  providerName: KARDIA_MAINNET,
  networkID: KARDIA_MAINNET_CODE,
  displayName: KARDIA_MAINNET_DISPLAY_NAME,
  displayNameDropdown: DROPDOWN_KARDIA_MAINNET_DISPLAY_NAME,
}
networks[KARDIA_MAINNET_CODE] = KARDIA_MAINNET_OBJ
networks[KARDIA_MAINNET] = KARDIA_MAINNET_OBJ

// const KARDIA_TESTNET_OBJ = {
//   order: 2,
//   chainType: TEST,
//   providerName: KARDIA_TESTNET,
//   networkID: KARDIA_TESTNET_CODE,
//   displayName: KARDIA_TESTNET_DISPLAY_NAME,
//   displayNameDropdown: DROPDOWN_KARDIA_TESTNET_DISPLAY_NAME,
// }
// networks[KARDIA_TESTNET_CODE] = KARDIA_TESTNET_OBJ
// networks[KARDIA_TESTNET] = KARDIA_TESTNET_OBJ

const getNetworkDisplayName = key => {
  console.log('key ', key)
  console.log(networks[key])
  console.log('------------------------------')
  return networks[key] ? networks[key].displayName : ''
}

function formatTxMetaForRpcResult (txMeta) {
  return {
    'blockHash': txMeta.txReceipt ? txMeta.txReceipt.blockHash : null,
    'blockNumber': txMeta.txReceipt ? txMeta.txReceipt.blockNumber : null,
    'from': txMeta.txParams.from,
    'gas': txMeta.txParams.gas,
    'gasPrice': txMeta.txParams.gasPrice,
    'hash': txMeta.hash,
    'input': txMeta.txParams.data || '0x',
    'nonce': txMeta.txParams.nonce,
    'to': txMeta.txParams.to,
    'transactionIndex': txMeta.txReceipt ? txMeta.txReceipt.transactionIndex : null,
    'value': txMeta.txParams.value || '0x0',
    'v': txMeta.v,
    'r': txMeta.r,
    's': txMeta.s,
  }
}

module.exports = {
  networks,
  getNetworkDisplayName,
  formatTxMetaForRpcResult,
}
