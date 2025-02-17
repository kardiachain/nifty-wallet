const version = 18

/*

This migration updates "transaction state history" to diffs style

*/

const clone = require('clone')
import { migrateFromSnapshotsToDiffs, snapshotFromTxMeta } from '../controllers/transactions/lib/tx-state-history-helpers'


module.exports = {
  version,

  migrate: function (originalVersionedData) {
    const versionedData = clone(originalVersionedData)
    versionedData.meta.version = version
    try {
      const state = versionedData.data
      const newState = transformState(state)
      versionedData.data = newState
    } catch (err) {
      console.warn(`KardiaChain Wallet Migration #${version}` + err.stack)
    }
    return Promise.resolve(versionedData)
  },
}

function transformState (state) {
  const newState = state
  const { TransactionController } = newState
  if (TransactionController && TransactionController.transactions) {
    const transactions = newState.TransactionController.transactions
    newState.TransactionController.transactions = transactions.map((txMeta) => {
      // no history: initialize
      if (!txMeta.history || txMeta.history.length === 0) {
        const snapshot = snapshotFromTxMeta(txMeta)
        txMeta.history = [snapshot]
        return txMeta
      }
      // has history: migrate
      const newHistory = (
        migrateFromSnapshotsToDiffs(txMeta.history)
        // remove empty diffs
        .filter((entry) => {
          return !Array.isArray(entry) || entry.length > 0
        })
      )
      txMeta.history = newHistory
      return txMeta
    })
  }
  return newState
}
