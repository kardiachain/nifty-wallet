const KeyringController = require('eth-keychain-controller')

export default class KardiaKeyringController extends KeyringController {
  signTransaction (ethTx, _fromAddress, opts = {}) {
    ethTx._chainId = 0
    return super.signTransaction(ethTx, _fromAddress, opts)
  }
}