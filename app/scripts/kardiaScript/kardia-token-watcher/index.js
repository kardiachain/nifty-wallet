// const Eth = require('ethjs-query')
const KardiaQuery = require('../kardia-query')
// const EthContract = require('ethjs-contract')
const KaiContract = require('../kai-contract')
const Token = require('./token')
const BlockTracker = require('eth-block-tracker')
const abi = require('human-standard-token-abi')
const SafeEventEmitter = require('safe-event-emitter')
const deepEqual = require('deep-equal')

class TokenTracker extends SafeEventEmitter {

  constructor (opts = {}) {
    super()

    this.userAddress = opts.userAddress || '0x0'
    this.provider = opts.provider
    const pollingInterval = opts.pollingInterval || 4000
    this.blockTracker = new BlockTracker({
      provider: this.provider,
      pollingInterval,
    })

    this.kai = new KardiaQuery(this.provider)
    this.contract = new KaiContract(this.kai)
    this.TokenContract = this.contract(abi, '', {
      'gas': 90000000,
      'gasPrice': 1,
      'value': 0,
    })

    const tokens = opts.tokens || []

    this.tokens = tokens.map((tokenOpts) => {
      return this.createTokenFrom(tokenOpts)
    })

    this.updateBalances = this.updateBalances.bind(this)

    this.running = true
    this.blockTracker.on('latest', this.updateBalances)
  }

  serialize () {
    return this.tokens.map(token => token.serialize())
  }

  async updateBalances () {
    const oldBalances = this.serialize()

    try {
      await Promise.all(this.tokens.map((token) => {
        return token.updateBalance()
      }))

      const newBalances = this.serialize()
      if (!deepEqual(newBalances, oldBalances)) {
        if (this.running) {
          this.emit('update', newBalances)
        }
      }
    } catch (reason) {
      this.emit('error', reason)
    }
  }

  createTokenFrom (opts) {
    const owner = this.userAddress
    const { address, symbol, balance, decimals, network } = opts
    const contract = this.TokenContract.at(address)
    return new Token({ address, symbol, balance, decimals, contract, owner, network })
  }

  add (opts) {
    const token = this.createTokenFrom(opts)
    this.tokens.push(token)
  }

  stop () {
    this.running = false
    this.blockTracker.removeListener('latest', this.updateBalances)
  }
}

module.exports = TokenTracker
