const { EventEmitter } = require('events')
const ethUtil = require('ethereumjs-util')

const { BN } = ethUtil
const bip39 = require('bip39')
const ObservableStore = require('obs-store')
const encryptor = require('browser-passworder')
const { normalize: normalizeAddress } = require('eth-sig-util')

// Keyrings:
const SimpleKeyring = require('../kardia-simple-keyring')
const HdKeyring = require('../kardia-hd-keyring')

const typeSimpleAddress = 'Simple Address'
class SimpleAddress extends EventEmitter {

  /* PUBLIC METHODS */

  constructor (opts) {
    super()
    this.type = typeSimpleAddress
    const wallet = {
      abi: opts && opts.abi,
      network: opts && opts.network,
      address: opts && opts.addr && opts.addr.toLowerCase(),
      contractType: opts && opts.contractType,
    }
    this.wallets = [wallet]
  }

  updateABI (address, network, newABI) {
    const savedWallet = this.wallets.find((w) => {
      return w.address.includes(normalizeAddress(address)) && w.network === network
    })
    if (!savedWallet) {
      throw new Error(`Address ${address} not found in this keyring`)
    }
    const wallet = {
      abi: newABI,
      network: savedWallet && savedWallet.network,
      address: savedWallet && savedWallet.address,
      contractType: savedWallet && savedWallet.contractType,
    }
    this.wallets = [wallet]
  }

  getAccounts () {
    return Promise.resolve(this.wallets.map((w) => ethUtil.bufferToHex(w.address)))
  }

  getProps () {
    return this.wallets && this.wallets[0]
  }

  removeAccount (address, network) {
    if (!this.wallets.map((w) => w.address.includes(address.toLowerCase()))) {
      throw new Error(`Address ${address} not found in this keyring`)
    }
    this.wallets = this.wallets.filter((w) => {
      return w.address.toLowerCase() !== address.toLowerCase() && w.network !== network
    })
  }
}

SimpleAddress.type = typeSimpleAddress


const keyringTypes = [
  SimpleKeyring,
  HdKeyring,
  SimpleAddress,
]

class KeyringController extends EventEmitter {

  // PUBLIC METHODS
  //
  // THE FIRST SECTION OF METHODS ARE PUBLIC-FACING,
  // MEANING THEY ARE USED BY CONSUMERS OF THIS CLASS.
  //
  // THEIR SURFACE AREA SHOULD BE CHANGED WITH GREAT CARE.

  constructor (opts) {
    super()
    const initState = opts.initState || { isCreatedWithCorrectDPath: false }
    this.keyringTypes = opts.keyringTypes ? keyringTypes.concat(opts.keyringTypes) : keyringTypes
    this.store = new ObservableStore(initState)
    this.memStore = new ObservableStore({
      isUnlocked: false,
      keyringTypes: this.keyringTypes.map((krt) => krt.type),
      keyrings: [],
    })

    this.encryptor = opts.encryptor || encryptor
    this.keyrings = []
    this.getNetwork = opts.getNetwork
  }

  /**
   * Full Update
   *
   * Emits the `update` event and @returns a Promise that resolves to
   * the current state.
   *
   * Frequently used to end asynchronous chains in this class,
   * indicating consumers can often either listen for updates,
   * or accept a state-resolving promise to consume their results.
   *
   * @returns {Object} The controller state.
   */
  fullUpdate () {
    this.emit('update', this.memStore.getState())
    return this.memStore.getState()
  }

  /**
   * Create New Vault And Keychain
   *
   * Destroys any old encrypted storage,
   * creates a new encrypted store with the given password,
   * randomly creates a new HD wallet with 1 account,
   * faucets that account on the testnet.
   *
   * @emits KeyringController#unlock
   * @param {string} password - The password to encrypt the vault with.
   * @returns {Promise<Object>} A Promise that resolves to the state.
   */
  createNewVaultAndKeychain (password) {
    return this.persistAllKeyrings(password)
      .then(this.createFirstKeyTree.bind(this))
      .then(this.persistAllKeyrings.bind(this, password))
      .then(this.setUnlocked.bind(this))
      .then(this.setCreatedWithCorrectDPath.bind(this))
      .then(this.fullUpdate.bind(this))
  }

  /**
   * CreateNewVaultAndRestore
   *
   * Destroys any old encrypted storage,
   * creates a new encrypted store with the given password,
   * creates a new HD wallet from the given seed with 1 account.
   *
   * @emits KeyringController#unlock
   * @param {string} password - The password to encrypt the vault with
   * @param {string} seed - The BIP44-compliant seed phrase.
   * @param {string} dPath - Accounts derivation path.
   * @returns {Promise<Object>} A Promise that resolves to the state.
   */
  createNewVaultAndRestore (password, seed, dpath) {
    if (typeof password !== 'string') {
      return Promise.reject(new Error('Password must be text.'))
    }

    if (!bip39.validateMnemonic(seed)) {
      return Promise.reject(new Error('Seed phrase is invalid.'))
    }

    this.clearKeyrings()

    return this.persistAllKeyrings(password)
      .then(() => {
        return this.addNewKeyring('HD Key Tree', {
          mnemonic: seed,
          numberOfAccounts: 1,
          hdPath: dpath,
        })
      })
      .then((firstKeyring) => {
        return firstKeyring.getAccounts()
      })
      .then(([firstAccount]) => {
        if (!firstAccount) {
          throw new Error('KeyringController - First Account not found.')
        }
        return null
      })
      .then(this.persistAllKeyrings.bind(this, password))
      .then(this.setUnlocked.bind(this))
      .then(this.setCreatedWithCorrectDPath.bind(this))
      .then(this.fullUpdate.bind(this))
  }

  /**
   * Set Locked
   *
   * This method deallocates all secrets, and effectively locks metamask.
   * @returns {Promise<Object>} A Promise that resolves to the state.
   */
  async setLocked () {
    // set locked
    this.password = null
    this.memStore.updateState({ isUnlocked: false })
    // remove keyrings
    this.keyrings = []
    await this._updateMemStoreKeyrings()
    return this.fullUpdate()
  }

  /**
   * Submit Password
   *
   * Attempts to decrypt the current vault and load its keyrings
   * into memory.
   *
   * Temporarily also migrates any old-style vaults first, as well.
   * (Pre MetaMask 3.0.0)
   *
   * @emits KeyringController#unlock
   * @param {string} password - The keyring controller password.
   * @param {string} dPath - Accounts derivation path.
   * @returns {Promise<Object>} A Promise that resolves to the state.
   */
  submitPassword (password, dPath) {
    const oldKeyrings = this.keyrings
    return this.unlockKeyrings(password, dPath)
      .then((keyrings) => {
        this.keyrings = keyrings
        this.setUnlocked()
        return this.fullUpdate()
      })
      .catch(async (err) => {
        this.keyrings = oldKeyrings
        await this._updateMemStoreKeyrings()
        return Promise.reject(new Error(err))
      })
  }

  deriveKeyringFromNewDPath (dPath) {
    const oldKeyrings = this.keyrings
    return this.unlockKeyrings(this.password, dPath)
      .then((keyrings) => {
        this.keyrings = keyrings
        return this.fullUpdate()
      })
      .catch(async (err) => {
        this.keyrings = oldKeyrings
        await this._updateMemStoreKeyrings()
        return Promise.reject(new Error(err))
      })
  }

  // Change Password
  // @string oldPassword
  // @string newPassword
  //
  // returns Promise( @object state )
  //
  // Attempts to decrypt the current vault, loads its keyrings into memory and changes password for unlocked keyrings
  changePassword (oldPassword, newPassword, dPath) {
    const oldKeyrings = this.keyrings
    return this.unlockKeyrings(oldPassword, dPath)
      .then((keyrings) => {
        this.keyrings = keyrings
        this.persistAllKeyrings(newPassword)
        return this.fullUpdate()
      })
      .catch(async (err) => {
        this.keyrings = oldKeyrings
        await this._updateMemStoreKeyrings()
        return Promise.reject(new Error(err))
      })
  }

  /**
   * Add New Keyring
   *
   * Adds a new Keyring of the given `type` to the vault
   * and the current decrypted Keyrings array.
   *
   * All Keyring classes implement a unique `type` string,
   * and this is used to retrieve them from the keyringTypes array.
   *
   * @param {string} type - The type of keyring to add.
   * @param {Object} opts - The constructor options for the keyring.
   * @returns {Promise<Keyring>} The new keyring.
   */
  addNewKeyring (type, opts) {
    const Keyring = this.getKeyringClassForType(type)
    const keyring = new Keyring(opts)
    return keyring.getAccounts()
      .then((accounts) => {
        return this.checkForDuplicate(type, accounts, opts)
      })
      .then(() => {
        this.keyrings.push(keyring)
        return this.persistAllKeyrings()
      })
      .then(() => this._updateMemStoreKeyrings())
      .then(() => this.fullUpdate())
      .then(() => {
        return keyring
      })
  }

  /**
   * Remove Empty Keyrings
   *
   * Loops through the keyrings and removes the ones with empty accounts
   * (usually after removing the last / only account) from a keyring
   */
  async removeEmptyKeyrings () {
    const validKeyrings = []

    // Since getAccounts returns a promise
    // We need to wait to hear back form each keyring
    // in order to decide which ones are now valid (accounts.length > 0)

    await Promise.all(this.keyrings.map(async (keyring) => {
      const accounts = await keyring.getAccounts()
      if (accounts.length > 0) {
        validKeyrings.push(keyring)
      }
    }))
    this.keyrings = validKeyrings

  }

  /**
   * Checks for duplicate keypairs, using the the first account in the given
   * array. Rejects if a duplicate is found.
   *
   * Only supports 'Simple Key Pair'.
   *
   * @param {string} type - The key pair type to check for.
   * @param {Array<string>} newAccountArray - Array of new accounts.
   * @param {Object} opts - Options.
   * @returns {Promise<Array<string>>} The account, if no duplicate is found.
   */
  checkForDuplicate (type, newAccount, opts) {
    return this.getAccounts()
      .then((accounts) => {
        switch (type) {
          case 'Simple Key Pair': {
            const isIncluded = accounts.find((key) => key === newAccount[0] || key === ethUtil.stripHexPrefix(newAccount[0]))
            return (isIncluded) ? Promise.reject(new Error('The account you\'re are trying to import is a duplicate')) : Promise.resolve(newAccount)
          }
          case typeSimpleAddress: {
            const isIncluded = this.keyrings.find((kr) => {
              const walletFound = kr.wallets && kr.wallets.find((wallet) => {
                return wallet.address === newAccount[0] && wallet.network === opts.network
              })
              return kr.type === type && walletFound
            })
            return (isIncluded) ? Promise.reject(new Error('The account you\'re are trying to import is a duplicate')) : Promise.resolve(newAccount)
          }
          default:
            return Promise.resolve(newAccount)
        }
      })
  }


  /**
   * Add New Account
   *
   * Calls the `addAccounts` method on the given keyring,
   * and then saves those changes.
   *
   * @param {Keyring} selectedKeyring - The currently selected keyring.
   * @returns {Promise<Object>} A Promise that resolves to the state.
   */
  addNewAccount (selectedKeyring) {
    return selectedKeyring.addAccounts(1)
      .then((accounts) => {
        accounts.forEach((hexAccount) => {
          this.emit('newAccount', hexAccount)
        })
      })
      .then(this.persistAllKeyrings.bind(this))
      .then(this._updateMemStoreKeyrings.bind(this))
      .then(this.fullUpdate.bind(this))
  }

  /**
   * Export Account
   *
   * Requests the private key from the keyring controlling
   * the specified address.
   *
   * Returns a Promise that may resolve with the private key string.
   *
   * @param {string} address - The address of the account to export.
   * @returns {Promise<string>} The private key of the account.
   */
  exportAccount (address, network) {
    try {
      return this.getKeyringForAccount(address, network)
        .then((keyring) => {
          return keyring.exportAccount(normalizeAddress(address))
        })
    } catch (e) {
      return Promise.reject(new Error(e))
    }
  }

  /**
   *
   * Remove Account
   *
   * Removes a specific account from a keyring
   * If the account is the last/only one then it also removes the keyring.
   *
   * @param {string} address - The address of the account to remove.
   * @param {string} network - The network where account to remove.
   * @returns {Promise<void>} A Promise that resolves if the operation was successful.
   */
  removeAccount (address, network) {
    return this.getKeyringForAccount(address, network)
      .then((keyring) => {
      // Not all the keyrings support this, so we have to check...
        if (typeof keyring.removeAccount === 'function') {
          keyring.removeAccount(address, network)
          this.emit('removedAccount', address)
          return keyring.getAccounts()

        }
        return Promise.reject(new Error(
          `Keyring ${keyring.type} doesn't support account removal operations`,
        ))
      })
      .then((accounts) => {
      // Check if this was the last/only account
        if (accounts.length === 0) {
          return this.removeEmptyKeyrings()
        }
        return undefined
      })
      .then(this.persistAllKeyrings.bind(this))
      .then(this._updateMemStoreKeyrings.bind(this))
      .then(this.fullUpdate.bind(this))
      .catch((e) => {
        return Promise.reject(e)
      })
  }


  //
  // SIGNING METHODS
  //

  /**
   * Sign Ethereum Transaction
   *
   * Signs an Ethereum transaction object.
   *
   * @param {Object} ethTx - The transaction to sign.
   * @param {string} _fromAddress - The transaction 'from' address.
   * @param {Object} opts - Signing options.
   * @returns {Promise<Object>} The signed transactio object.
   */

  signTransaction (ethTx, _fromAddress, opts = {}) {
    console.log('_fromAddress ', _fromAddress)
    const fromAddress = normalizeAddress(_fromAddress)
    console.log('fromAddress ', fromAddress)
    return this.getKeyringForAccount(fromAddress)
      .then((keyring) => {
        return keyring.signTransaction(fromAddress, ethTx, opts)
      })
  }

  /**
   * Sign Message
   *
   * Attempts to sign the provided message parameters.
   *
   * @param {Object} msgParams - The message parameters to sign.
   * @returns {Promise<Buffer>} The raw signature.
   */
  signMessage (msgParams, opts = {}) {
    const address = normalizeAddress(msgParams.from)
    return this.getKeyringForAccount(address)
      .then((keyring) => {
        return keyring.signMessage(address, msgParams.data, opts)
      })
  }

  /**
   * Sign Personal Message
   *
   * Attempts to sign the provided message paramaters.
   * Prefixes the hash before signing per the personal sign expectation.
   *
   * @param {Object} msgParams - The message parameters to sign.
   * @returns {Promise<Buffer>} The raw signature.
   */
  signPersonalMessage (msgParams, opts = {}) {
    const address = normalizeAddress(msgParams.from)
    return this.getKeyringForAccount(address)
      .then((keyring) => {
        return keyring.signPersonalMessage(address, msgParams.data, opts)
      })
  }

  /**
   * Get encryption public key
   *
   * Get encryption public key for using in encrypt/decrypt process.
   *
   * @param {Object} address - The address to get the encryption public key for.
   * @returns {Promise<Buffer>} The public key.
   */
  getEncryptionPublicKey (_address, opts = {}) {
    const address = normalizeAddress(_address)
    return this.getKeyringForAccount(address)
      .then((keyring) => {
        return keyring.getEncryptionPublicKey(address, opts)
      })
  }

  /**
   * Decrypt Message
   *
   * Attempts to decrypt the provided message parameters.
   *
   * @param {Object} msgParams - The decryption message parameters.
   * @returns {Promise<Buffer>} The raw decryption result.
   */
  decryptMessage (msgParams, opts = {}) {
    const address = normalizeAddress(msgParams.from)
    return this.getKeyringForAccount(address)
      .then((keyring) => {
        return keyring.decryptMessage(address, msgParams.data, opts)
      })
  }

  /**
   * Sign Typed Data
   * (EIP712 https://github.com/ethereum/EIPs/pull/712#issuecomment-329988454)
   *
   * @param {Object} msgParams - The message parameters to sign.
   * @returns {Promise<Buffer>} The raw signature.
   */
  signTypedMessage (msgParams, opts = { version: 'V1' }) {
    const address = normalizeAddress(msgParams.from)
    return this.getKeyringForAccount(address)
      .then((keyring) => {
        return keyring.signTypedData(address, msgParams.data, opts)
      })
  }

  /**
   * Gets the app key address for the given Ethereum address and origin.
   *
   * @param {string} _address - The Ethereum address for the app key.
   * @param {string} origin - The origin for the app key.
   * @param {string} network - current network.
   * @returns {string} The app key address.
   */
  async getAppKeyAddress (_address, origin, network) {
    const address = normalizeAddress(_address)
    const keyring = await this.getKeyringForAccount(address, network)
    return keyring.getAppKeyAddress(address, origin)
  }

  /**
   * Exports an app key private key for the given Ethereum address and origin.
   *
   * @param {string} _address - The Ethereum address for the app key.
   * @param {string} origin - The origin for the app key.
   * @param {string} network - current network.
   * @returns {string} The app key private key.
   */
  async exportAppKeyForAddress (_address, origin, network) {
    const address = normalizeAddress(_address)
    const keyring = await this.getKeyringForAccount(address, network)
    if (!('exportAccount' in keyring)) {
      throw new Error(`The keyring for address ${_address} does not support exporting.`)
    }
    return keyring.exportAccount(address, { withAppKeyOrigin: origin })
  }

  //
  // PRIVATE METHODS
  //

  /**
   * Create First Key Tree
   *
   * - Clears the existing vault
   * - Creates a new vault
   * - Creates a random new HD Keyring with 1 account
   * - Makes that account the selected account
   * - Faucets that account on testnet
   * - Puts the current seed words into the state tree
   *
   * @returns {Promise<void>} - A promise that resovles if the operation was successful.
   */
  createFirstKeyTree () {
    this.clearKeyrings()
    return this.addNewKeyring('HD Key Tree', { numberOfAccounts: 1 })
      .then((keyring) => {
        return keyring.getAccounts()
      })
      .then(([firstAccount]) => {
        if (!firstAccount) {
          throw new Error('KeyringController - No account found on keychain.')
        }
        const hexAccount = normalizeAddress(firstAccount)
        this.emit('newVault', hexAccount)
        return null
      })
  }

  /**
   * Persist All Keyrings
   *
   * Iterates the current `keyrings` array,
   * serializes each one into a serialized array,
   * encrypts that array with the provided `password`,
   * and persists that encrypted string to storage.
   *
   * @param {string} password - The keyring controller password.
   * @returns {Promise<boolean>} Resolves to true once keyrings are persisted.
   */
  persistAllKeyrings (password = this.password) {
    if (typeof password !== 'string') {
      return Promise.reject(new Error(
        'KeyringController - password is not a string',
      ))
    }

    this.password = password
    return Promise.all(this.keyrings.map((keyring) => {
      if (keyring.type === typeSimpleAddress) {
        return {
          type: typeSimpleAddress,
          data: keyring.wallets,
        }
      }
      return Promise.all([keyring.type, keyring.serialize()])
        .then((serializedKeyringArray) => {
          // Label the output values on each serialized Keyring:
          return {
            type: serializedKeyringArray[0],
            data: serializedKeyringArray[1],
          }
        })

    }))
      .then((serializedKeyrings) => {
        return this.encryptor.encrypt(this.password, serializedKeyrings)
      })
      .then((encryptedString) => {
        this.store.updateState({ vault: encryptedString })
        return true
      })
  }

  /**
   * Unlock Keyrings
   *
   * Attempts to unlock the persisted encrypted storage,
   * initializing the persisted keyrings to RAM.
   *
   * @param {string} password - The keyring controller password.
   * @param {string} dPath - Accounts derivation path.
   * @returns {Promise<Array<Keyring>>} The keyrings.
   */
  async unlockKeyrings (password, dPath) {
    const encryptedVault = this.store.getState().vault
    if (!encryptedVault) {
      throw new Error('Cannot unlock without a previous vault.')
    }

    await this.clearKeyrings()
    let vaults
    try {
      vaults = await this.encryptor.decrypt(password, encryptedVault)
    } catch (e) {
      return Promise.reject(new Error('Incorrect password'))
    }
    this.password = password
    this.memStore.updateState({ isUnlocked: true })
    const vaultsUpdated = vaults.map((vault) => {
      vault.data.hdPath = dPath
      return vault
    })
    await Promise.all(vaultsUpdated.map(this.restoreKeyring.bind(this)))
    return this.keyrings
  }

  /**
   * Restore Keyring
   *
   * Attempts to initialize a new keyring from the provided
   * serialized payload.
   *
   * On success, the resulting keyring instance.
   *
   * @param {Object} serialized - The serialized keyring.
   * @returns {Promise<Keyring>} The deserialized keyring.
   */
  restoreKeyring (serialized) {
    const { type, data } = serialized

    const Keyring = this.getKeyringClassForType(type)
    const keyring = new Keyring()
    let ddata
    if (type === typeSimpleAddress) {
      ddata = new Promise((resolve) => {
        keyring.wallets = data
        resolve()
      })
    } else {
      ddata = keyring.deserialize(data)
    }
    return ddata
      .then(() => {
        return keyring.getAccounts()
      })
      .then(() => {
        this.keyrings.push(keyring)
        return this._updateMemStoreKeyrings()
      })
      .then(() => {
        return keyring
      })
  }

  /**
   * Get Keyring Class For Type
   *
   * Searches the current `keyringTypes` array
   * for a Keyring class whose unique `type` property
   * matches the provided `type`,
   * returning it if it exists.
   *
   * @param {string} type - The type whose class to get.
   * @returns {Keyring|undefined} The class, if it exists.
   */
  getKeyringClassForType (type) {
    return this.keyringTypes.find((kr) => kr.type === type)
  }

  /**
   * Get Keyrings by Type
   *
   * Gets all keyrings of the given type.
   *
   * @param {string} type - The keyring types to retrieve.
   * @returns {Array<Keyring>} The keyrings.
   */
  getKeyringsByType (type) {
    return this.keyrings.filter((keyring) => keyring.type === type)
  }

  /**
   * Get Accounts
   *
   * Returns the public addresses of all current accounts
   * managed by all currently unlocked keyrings.
   *
   * @returns {Promise<Array<string>>} The array of accounts.
   */
  async getAccounts () {
    const keyrings = this.keyrings || []
    const addrs = await Promise.all(keyrings.map((kr) => kr.getAccounts()))
      .then((keyringArrays) => {
        return keyringArrays.reduce((res, arr) => {
          return res.concat(arr)
        }, [])
      })
    return addrs.map(normalizeAddress)
  }

  // Get Properties of multisig
  // @string multisigAddr
  //
  // Returns the public properties of account.
  getProps (multisigAddr) {
    if (!multisigAddr) {
      return {}
    }
    const keyrings = this.keyrings || []
    const keyringsFiltered = keyrings.filter((kr, _ind) => {
      const addressFromKeyring = kr.getProps && kr.getProps().address && kr.getProps().address.toLowerCase()
      return addressFromKeyring === multisigAddr.toLowerCase()
    })
    const keyringsPropsArr = keyringsFiltered.map((kr) => kr.getProps())
    const keyringsProps = keyringsPropsArr && keyringsPropsArr[0]
    return keyringsProps
  }

  // Updates ABI of implementation for proxy contract
  // @string proxyAddr
  // @string network
  // @string newABI
  //
  // Returns nothing
  // todo network is not used
  updateABI (proxyAddr, network, newABI) {
    if (!proxyAddr) {
      return {}
    }
    const keyrings = this.keyrings || []
    const keyringsFiltered = keyrings.filter((kr, _ind) => {
      const addressFromKeyring = kr.getProps && kr.getProps().address && kr.getProps().address.toLowerCase()
      return addressFromKeyring === proxyAddr.toLowerCase()
    })
    keyringsFiltered.map((kr) => kr.updateABI(proxyAddr, network, newABI))
    return undefined
  }

  /**
   * Get Keyring For Account
   *
   * Returns the currently initialized keyring that manages
   * the specified `address` if one exists at specified `network`.
   *
   * @param {string} address - An account address.
   * @param {string} network - current network.
   * @returns {Promise<Keyring>} The keyring of the account, if it exists.
   */
  getKeyringForAccount (address, network) {
    const hexed = normalizeAddress(address)

    return Promise.all(this.keyrings.map((keyring) => {
      return Promise.all([
        keyring,
        keyring.getAccounts(),
      ])
    }))
      .then((candidates) => {
        const winners = candidates.filter((candidate) => {
          let isCorrectNetwork = true
          const candidateType = candidate && candidate[0] && candidate[0].type
          if (candidateType === typeSimpleAddress) {
            const props = candidate && candidate[0] && candidate[0].getProps && candidate[0].getProps()
            isCorrectNetwork = props.network === network
          }
          const accounts = candidate[1].map(normalizeAddress)
          return accounts.includes(hexed) && isCorrectNetwork
        })

        if (winners && winners.length > 0) {
          return winners[0][0]
        }
        throw new Error('No keyring found for the requested account.')
      })
  }

  // Display For Keyring
  // @Keyring keyring
  //
  // returns Promise( @Object { type:String, accounts:Array } )
  //
  // Is used for adding the current keyrings to the state object.
  displayForKeyring (keyring) {
    let network
    if (keyring.type === typeSimpleAddress) {
      network = keyring.wallets && keyring.wallets[0] && keyring.wallets[0].network
    }
    return keyring.getAccounts()
      .then((accounts) => {
        return {
          type: keyring.type,
          accounts: accounts.map(normalizeAddress),
          network,
        }
      })
  }

  /**
   * Add Gas Buffer
   *
   * Adds a healthy buffer of gas to an initial gas estimate.
   *
   * @param {string} gas - The gas value, as a hex string.
   * @returns {string} The buffered gas, as a hex string.
   */
  addGasBuffer (gas) {
    const gasBuffer = new BN('100000', 10)
    const bnGas = new BN(ethUtil.stripHexPrefix(gas), 16)
    const correct = bnGas.add(gasBuffer)
    return ethUtil.addHexPrefix(correct.toString(16))
  }

  /**
   * Clear Keyrings
   *
   * Deallocates all currently managed keyrings and accounts.
   * Used before initializing a new vault.
   */
  /* eslint-disable require-await */
  async clearKeyrings () {
    // clear keyrings from memory
    this.keyrings = []
    this.memStore.updateState({
      keyrings: [],
    })
  }

  /**
   * Update Memstore Keyrings
   *
   * Updates the in-memory keyrings, without persisting.
   */
  async _updateMemStoreKeyrings () {
    const keyrings = await Promise.all(this.keyrings.map(this.displayForKeyring))
    return this.memStore.updateState({ keyrings })
  }

  /**
   * Unlock Keyrings
   *
   * Unlocks the keyrings.
   *
   * @emits KeyringController#unlock
   */
  setUnlocked () {
    this.memStore.updateState({ isUnlocked: true })
    this.emit('unlock', true)
  }

  setCreatedWithCorrectDPath () {
    this.store.updateState({ isCreatedWithCorrectDPath: true })
  }

  isCreatedWithCorrectDPath () {
    return Promise.resolve(this.store.getState().isCreatedWithCorrectDPath)
  }

}

module.exports = KeyringController
