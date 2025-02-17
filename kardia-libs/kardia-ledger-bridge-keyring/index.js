const {EventEmitter} = require('events')
const HDKey = require('hdkey')
const ethUtil = require('ethereumjs-util')
const sigUtil = require('eth-sig-util')
// const Transaction = require('ethereumjs-tx')
const Transaction = require('../kardia-tx')

const hdPathString = `m/44'/60'/0'`
const type = 'Ledger Hardware'
const BRIDGE_URL = 'https://vbaranov.github.io/eth-ledger-bridge-keyring'
const pathBase = 'm'
const MAX_INDEX = 1000
const NETWORK_API_URLS = {
  // ropsten: 'http://api-ropsten.etherscan.io',
  // kovan: 'http://api-kovan.etherscan.io',
  // rinkeby: 'https://api-rinkeby.etherscan.io',
  // mainnet: 'https://api.etherscan.io',
  // sokol: 'https://blockscout.com/poa/sokol/api',
  // poa: 'https://blockscout.com/poa/core/api',
  // xdai: 'https://blockscout.com/poa/dai/api',
}

class LedgerBridgeKeyring extends EventEmitter {
  constructor (opts = {}) {
    super()
    this.bridgeUrl = null
    this.type = type
    this.page = 0
    this.perPage = 5
    this.unlockedAccount = 0
    this.hdk = new HDKey()
    this.paths = {}
    this.iframe = null
    this.network = 'mainnet'
    this.implementFullBIP44 = false
    this.deserialize(opts)
    this.iframeLoaded = false
    this._setupIframe()
  }

  serialize () {
    return Promise.resolve({
      hdPath: this.hdPath,
      accounts: this.accounts,
      bridgeUrl: this.bridgeUrl,
      implementFullBIP44: false,
    })
  }

  deserialize (opts = {}) {
    this.hdPath = opts.hdPath || hdPathString
    this.bridgeUrl = opts.bridgeUrl || BRIDGE_URL
    this.accounts = opts.accounts || []
    this.implementFullBIP44 = opts.implementFullBIP44 || false

    if (this._isBIP44()) {
      // Remove accounts that don't have corresponding account indexes
      this.accounts = this.accounts
        .filter((account) => Object.keys(this.accountIndexes).includes(ethUtil.toChecksumAddress(account)))
    }

    return Promise.resolve()
  }

  isUnlocked () {
    return Boolean(this.hdk && this.hdk.publicKey)
  }

  setAccountToUnlock (index) {
    this.unlockedAccount = parseInt(index, 10)
  }

  setHdPath (hdPath) {
    // Reset HDKey if the path changes
    if (this.hdPath !== hdPath) {
      this.hdk = new HDKey()
    }
    this.hdPath = hdPath
  }

  unlock (hdPath) {
    if (this.isUnlocked() && !hdPath) return Promise.resolve('already unlocked')
    const path = hdPath ? this._toLedgerPath(hdPath) : this.hdPath
    return new Promise((resolve, reject) => {
      this._sendMessage({
        action: 'ledger-unlock',
        params: {
          hdPath: path,
        },
      },
      ({success, payload}) => {
        if (success) {
          this.hdk.publicKey = new Buffer(payload.publicKey, 'hex')
          this.hdk.chainCode = new Buffer(payload.chainCode, 'hex')
          resolve(payload.address)
        } else {
          reject(payload.error || 'Unknown error')
        }
      })
    })
  }

  addAccounts (n = 1) {

    return new Promise((resolve, reject) => {
      this.unlock()
        .then(async _ => {
          const from = this.unlockedAccount
          const to = from + n
          // do not clear previous accounts on adding
          // this.accounts = []
          for (let i = from; i < to; i++) {
            let address
            if (this._isBIP44()) {
              const path = this._getPathForIndex(i)
              address = await this.unlock(path)
            } else {
              address = this._addressFromIndex(pathBase, i)
            }
            if (!this.accounts.includes(address)) {
              this.accounts.push(address)
            }
            this.page = 0
          }
          resolve(this.accounts)
        })
        .catch(e => {
          reject(e)
        })
    })
  }

  getFirstPage () {
    this.page = 0
    return this.__getPage(1)
  }

  getNextPage () {
    return this.__getPage(1)
  }

  getPreviousPage () {
    return this.__getPage(-1)
  }

  getAccounts () {
    return Promise.resolve(this.accounts.slice())
  }

  removeAccount (address) {
    if (!this.accounts.map(a => a.toLowerCase()).includes(address.toLowerCase())) {
      throw new Error(`Address ${address} not found in this keyring`)
    }
    this.accounts = this.accounts.filter(a => a.toLowerCase() !== address.toLowerCase())
  }

  // tx is an instance of the ethereumjs-transaction class.
  signTransaction (address, tx) {
    return new Promise((resolve, reject) => {
      this.unlock()
        .then(_ => {
          const rawTx = new Transaction({
            nonce: this._normalize(tx.nonce),
            gasPrice: tx.gasPrice,
            gasLimit: this._normalize(tx.gas),
            to: this._normalize(tx.to),
            value: this._normalize(tx.value),
            data: this._normalize(tx.data),
          })

          let hdPath
          if (this._isBIP44()) {
            hdPath = this._getPathForIndex(this.unlockedAccount)
          } else {
            hdPath = this._toLedgerPath(this._pathFromAddress(address))
          }

          this._sendMessage({
            action: 'ledger-sign-transaction',
            params: {
              tx: rawTx.kardiaSerialize().toString('hex'),
              hdPath,
            },
          },
          ({success, payload}) => {
            if (success) {

              tx.v = Buffer.from(payload.v, 'hex')
              tx.r = Buffer.from(payload.r, 'hex')
              tx.s = Buffer.from(payload.s, 'hex')

              const valid = tx.verifySignature()
              if (valid) {
                resolve(tx)
              } else {
                reject('The transaction signature is not valid')
              }
            } else {
              reject(payload)
            }
          })
      })
    })
  }

  signMessage (withAccount, data) {
    return this.signPersonalMessage(withAccount, data)
  }

  // For personal_sign, we need to prefix the message:
  signPersonalMessage (withAccount, message) {
    return new Promise((resolve, reject) => {
      this.unlock()
        .then((_) => {
          let hdPath
          if (this._isBIP44()) {
            const checksummedAddress = ethUtil.toChecksumAddress(withAccount)
            if (!Object.keys(this.accountIndexes).includes(checksummedAddress)) {
              reject(new Error(`Ledger: Index for address '${checksummedAddress}' not found`))
            }
            hdPath = this._getPathForIndex(this.accountIndexes[checksummedAddress])
          } else {
            hdPath = this._toLedgerPath(this._pathFromAddress(withAccount))
          }

          this._sendMessage({
            action: 'ledger-sign-personal-message',
            params: {
              hdPath,
              message: ethUtil.stripHexPrefix(message),
            },
          },
          ({ success, payload }) => {
            if (success) {
              let v = payload.v - 27
              v = v.toString(16)
              if (v.length < 2) {
                v = `0${v}`
              }
              const signature = `0x${payload.r}${payload.s}${v}`
              const addressSignedWith = sigUtil.recoverPersonalSignature({ data: message, sig: signature })
              if (ethUtil.toChecksumAddress(addressSignedWith) !== ethUtil.toChecksumAddress(withAccount)) {
                reject(new Error('Ledger: The signature doesnt match the right address'))
              }
              resolve(signature)
            } else {
              reject(new Error(payload.error || 'Ledger: Uknown error while signing message'))
            }
          })
        })
    })
  }

  signTypedData (withAccount, typedData) {
    throw new Error('Not supported on this device')
  }

  exportAccount (address) {
    throw new Error('Not supported on this device')
  }

  forgetDevice (clearAccounts) {
    let accountsToForget = []
    if (clearAccounts) {
      accountsToForget = this.accounts
      this.accounts = []
    }
    this.page = 0
    this.unlockedAccount = 0
    this.paths = {}
    this.hdk = new HDKey()
    return accountsToForget
  }

  updateTransportMethod (useLedgerLive = false) {
    return new Promise((resolve, reject) => {
      // If the iframe isn't loaded yet, let's store the desired useLedgerLive value and
      // optimistically return a successful promise
      if (!this.iframeLoaded) {
        this.delayedPromise = {
          resolve,
          reject,
          useLedgerLive,
        }
        return
      }
      console.log('call updateTransportMethod', useLedgerLive)
      this._sendMessage({
        action: 'ledger-update-transport',
        params: { useLedgerLive },
      }, ({ success }) => {
        if (success) {
          resolve(true)
        } else {
          reject(new Error('Ledger transport could not be updated'))
        }
      })
    })
  }

  /* PRIVATE METHODS */

  _setupIframe () {
    this.iframe = document.createElement('iframe')
    this.iframe.src = this.bridgeUrl
    this.iframe.onload = async () => {
      // If the ledger live preference was set before the iframe is loaded,
      // set it after the iframe has loaded
      this.iframeLoaded = true
      if (this.delayedPromise) {
        try {
          const result = await this.updateTransportMethod(
            this.delayedPromise.useLedgerLive,
          )
          this.delayedPromise.resolve(result)
        } catch (e) {
          this.delayedPromise.reject(e)
        } finally {
          delete this.delayedPromise
        }
      }
    }
    document.head.appendChild(this.iframe)
  }
  _getOrigin () {
    const tmp = this.bridgeUrl.split('/')
    tmp.splice(-1, 1)
    return tmp.join('/')
  }

  _sendMessage (msg, cb) {
    msg.target = 'LEDGER-IFRAME'
    // this.iframe.contentWindow.postMessage(msg, '*')
    this.iframe.contentWindow.postMessage(msg, 'https://vbaranov.github.io')
    window.addEventListener('message', ({ origin, data }) => {
      if (origin !== this._getOrigin()) return false
      if (data && data.action && data.action === `${msg.action}-reply`) {
        cb(data)
      }
    })
  }

  __getPage (increment) {

    this.page += increment

    if (this.page <= 0) { this.page = 1 }
    const from = (this.page - 1) * this.perPage
    const to = from + this.perPage

    return new Promise((resolve, reject) => {
      this.unlock()
        .then(async _ => {
          let accounts
          if (this._isBIP44()) {
            accounts = await this._getAccountsBIP44(from, to)
          } else {
            accounts = this._getAccountsLegacy(from, to)
          }
          resolve(accounts)
        })
        .catch(e => {
          reject(e)
        })
    })
  }

  async _getAccountsBIP44 (from, to) {
    const accounts = []

    for (let i = from; i < to; i++) {
      const path = this._getPathForIndex(i)
      const address = await this.unlock(path)
      const valid = this.implementFullBIP44 ? await this._hasPreviousTransactions(address) : true
      accounts.push({
        address: address,
        balance: null,
        index: i,
      })
      // PER BIP44
      // "Software should prevent a creation of an account if
      // a previous account does not have a transaction history
      // (meaning none of its addresses have been used before)."
      if (!valid) {
        break
      }
    }
    return accounts
  }

  _getAccountsLegacy (from, to) {
    const accounts = []

    for (let i = from; i < to; i++) {
      const address = this._addressFromIndex(pathBase, i)
      accounts.push({
        address: address,
        balance: null,
        index: i,
      })
      this.paths[ethUtil.toChecksumAddress(address)] = i
    }
    return accounts
  }

  _padLeftEven (hex) {
    return hex.length % 2 !== 0 ? `0${hex}` : hex
  }

  _normalize (buf) {
    return this._padLeftEven(ethUtil.bufferToHex(buf).toLowerCase())
  }

  _addressFromIndex (pathBase, i) {
    const dkey = this.hdk.derive(`${pathBase}/${i}`)
    const address = ethUtil
      .publicToAddress(dkey.publicKey, true)
      .toString('hex')
    return ethUtil.toChecksumAddress(address)
  }

  _pathFromAddress (address) {
    const checksummedAddress = ethUtil.toChecksumAddress(address)
    let index = this.paths[checksummedAddress]
    if (typeof index === 'undefined') {
      for (let i = 0; i < MAX_INDEX; i++) {
        if (checksummedAddress === this._addressFromIndex(pathBase, i)) {
          index = i
          break
        }
      }
    }

    if (typeof index === 'undefined') {
      throw new Error('Unknown address')
    }
    return this._getPathForIndex(index)
  }

  _toAscii (hex) {
      let str = ''
      let i = 0; const l = hex.length
      if (hex.substring(0, 2) === '0x') {
          i = 2
      }
      for (; i < l; i += 2) {
          const code = parseInt(hex.substr(i, 2), 16)
          str += String.fromCharCode(code)
      }

      return str
  }

  _getPathForIndex (index) {
    // Check if the path is BIP 44 (Ledger Live)
    return this._isBIP44() ? `m/44'/60'/${index}'/0/0` : `${this.hdPath}/${index}`
  }

  _isBIP44 () {
    return this.hdPath === `m/44'/60'/0'/0/0`
  }

  _toLedgerPath (path) {
    return path.toString().replace('m/', '')
  }

  async _hasPreviousTransactions (address) {
    const apiUrl = this._getApiUrl()
    const response = await fetch(`${apiUrl}/api?module=account&action=txlist&address=${address}&tag=latest&page=1&offset=1`)
    const parsedResponse = await response.json()
    if (parsedResponse.status !== '0' && parsedResponse.result.length > 0) {
      return true
    }
    return false
  }

  _getApiUrl () {
    return NETWORK_API_URLS[this.network] ? NETWORK_API_URLS[this.network] : NETWORK_API_URLS['mainnet']
  }

}

LedgerBridgeKeyring.type = type
module.exports = LedgerBridgeKeyring
