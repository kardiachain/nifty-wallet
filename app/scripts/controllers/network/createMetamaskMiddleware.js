import { createScaffoldMiddleware, mergeMiddleware } from 'json-rpc-engine'
import createWalletSubprovider from 'eth-json-rpc-middleware/wallet'
import { createPendingNonceMiddleware } from './middleware/pending'

export default createMetamaskMiddleware

function createMetamaskMiddleware ({
  version,
  getAccounts,
  processTransaction,
  processEthSignMessage,
  processTypedMessage,
  processTypedMessageV3,
  processTypedMessageV4,
  processPersonalMessage,
  processDecryptMessage,
  processEncryptionPublicKey,
  getPendingNonce,
}) {
  const metamaskMiddleware = mergeMiddleware([
    createScaffoldMiddleware({
      // staticSubprovider
      eth_syncing: false,
      web3_clientVersion: `KardiaChainWallet/v${version}`,
    }),
    createWalletSubprovider({
      getAccounts,
      processTransaction,
      processEthSignMessage,
      processTypedMessage,
      processTypedMessageV3,
      processTypedMessageV4,
      processPersonalMessage,
      processDecryptMessage,
      processEncryptionPublicKey,
    }),
    createPendingNonceMiddleware({ getPendingNonce }),
  ])
  return metamaskMiddleware
}
