const extend = require('xtend')
const createRandomId = require('json-rpc-random-id')()

module.exports = KardiaQuery


function KardiaQuery (provider) {
  const self = this
  self.currentProvider = provider
}

//
// base queries
//

// default block
KardiaQuery.prototype.getBalance = generateFnWithDefaultBlockFor(2, 'account_balance')
KardiaQuery.prototype.getCode = generateFnWithDefaultBlockFor(2, 'account_getCode')
// KardiaQuery.prototype.getTransactionCount = generateFnWithDefaultBlockFor(2, 'account_nonce')
KardiaQuery.prototype.getTransactionCount = generateFnFor('account_nonce')
KardiaQuery.prototype.getStorageAt = generateFnWithDefaultBlockFor(3, 'eth_getStorageAt')
KardiaQuery.prototype.call = generateFnWithDefaultBlockFor(2, 'eth_call')
// standard
KardiaQuery.prototype.protocolVersion = generateFnFor('eth_protocolVersion')
KardiaQuery.prototype.syncing = generateFnFor('eth_syncing')
KardiaQuery.prototype.coinbase = generateFnFor('eth_coinbase')
KardiaQuery.prototype.mining = generateFnFor('eth_mining')
KardiaQuery.prototype.hashrate = generateFnFor('eth_hashrate')
KardiaQuery.prototype.gasPrice = generateFnFor('eth_gasPrice')
KardiaQuery.prototype.accounts = generateFnFor('eth_accounts')
KardiaQuery.prototype.blockNumber = generateFnFor('kai_blockNumber')
KardiaQuery.prototype.getBlockTransactionCountByHash = generateFnFor('eth_getBlockTransactionCountByHash')
KardiaQuery.prototype.getBlockTransactionCountByNumber = generateFnFor('eth_getBlockTransactionCountByNumber')
KardiaQuery.prototype.getUncleCountByBlockHash = generateFnFor('eth_getUncleCountByBlockHash')
KardiaQuery.prototype.getUncleCountByBlockNumber = generateFnFor('eth_getUncleCountByBlockNumber')
KardiaQuery.prototype.sign = generateFnFor('eth_sign')
KardiaQuery.prototype.sendTransaction = generateFnFor('tx_sendRawTransaction')
KardiaQuery.prototype.sendRawTransaction = generateFnFor('eth_sendRawTransaction')
KardiaQuery.prototype.estimateGas = generateFnFor('eth_estimateGas')
KardiaQuery.prototype.getBlockByHash = generateFnFor('kai_getBlockByHash')
KardiaQuery.prototype.getBlockByNumber = generateFnFor('kai_getBlockByNumber')
KardiaQuery.prototype.getTransactionByHash = generateFnFor('tx_getTransaction')
KardiaQuery.prototype.getTransactionByBlockHashAndIndex = generateFnFor('eth_getTransactionByBlockHashAndIndex')
KardiaQuery.prototype.getTransactionByBlockNumberAndIndex = generateFnFor('eth_getTransactionByBlockNumberAndIndex')
KardiaQuery.prototype.getTransactionReceipt = generateFnFor('eth_getTransactionReceipt')
KardiaQuery.prototype.getUncleByBlockHashAndIndex = generateFnFor('eth_getUncleByBlockHashAndIndex')
KardiaQuery.prototype.getUncleByBlockNumberAndIndex = generateFnFor('eth_getUncleByBlockNumberAndIndex')
KardiaQuery.prototype.getCompilers = generateFnFor('eth_getCompilers')
KardiaQuery.prototype.compileLLL = generateFnFor('eth_compileLLL')
KardiaQuery.prototype.compileSolidity = generateFnFor('eth_compileSolidity')
KardiaQuery.prototype.compileSerpent = generateFnFor('eth_compileSerpent')
KardiaQuery.prototype.newFilter = generateFnFor('eth_newFilter')
KardiaQuery.prototype.newBlockFilter = generateFnFor('eth_newBlockFilter')
KardiaQuery.prototype.newPendingTransactionFilter = generateFnFor('eth_newPendingTransactionFilter')
KardiaQuery.prototype.uninstallFilter = generateFnFor('eth_uninstallFilter')
KardiaQuery.prototype.getFilterChanges = generateFnFor('eth_getFilterChanges')
KardiaQuery.prototype.getFilterLogs = generateFnFor('eth_getFilterLogs')
KardiaQuery.prototype.getLogs = generateFnFor('eth_getLogs')
KardiaQuery.prototype.getWork = generateFnFor('eth_getWork')
KardiaQuery.prototype.submitWork = generateFnFor('eth_submitWork')
KardiaQuery.prototype.submitHashrate = generateFnFor('eth_submitHashrate')

// network level

KardiaQuery.prototype.sendAsync = function (opts, cb) {
  const self = this
  self.currentProvider.sendAsync(createPayload(opts), function (err, response) {
    if (!err && response.error) err = new Error('KardiaQuery - RPC Error - ' + response.error.message)
    if (err) return cb(err)
    cb(null, response.result)
  })
}

// util

function generateFnFor (methodName) {
  return function () {
    const self = this
    var args = [].slice.call(arguments)
    var cb = args.pop()
    self.sendAsync({
      method: methodName,
      params: args,
    }, cb)
  }
}

function generateFnWithDefaultBlockFor (argCount, methodName) {
  return function () {
    const self = this
    var args = [].slice.call(arguments)
    var cb = args.pop()
    // set optional default block param
    if (args.length < argCount) args.push('latest')
    self.sendAsync({
      method: methodName,
      params: args,
    }, cb)
  }
}

function createPayload (data) {
  return extend({
    // defaults
    id: createRandomId(),
    jsonrpc: '2.0',
    params: [],
    // user-specified
  }, data)
}
