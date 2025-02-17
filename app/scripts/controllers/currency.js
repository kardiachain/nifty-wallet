import { ObservableStore } from '@metamask/obs-store'
const extend = require('xtend')
const log = require('loglevel')

// every ten minutes
const POLLING_INTERVAL = 600000

class CurrencyController {

  /**
   * Controller responsible for managing data associated with the currently selected currency.
   *
   * @typedef {Object} CurrencyController
   * @param {object} opts Overrides the defaults for the initial state of this.store
   * @property {array} opts.initState  initializes the the state of the CurrencyController. Can contain an
   * currentCurrency, conversionRate and conversionDate properties
   * @property {string} currentCurrency A 2-4 character shorthand that describes a specific currency, currently
   * selected by the user
   * @property {number} conversionRate The conversion rate from ETH to the selected currency.
   * @property {string} conversionDate The date at which the conversion rate was set. Expressed in in milliseconds
   * since midnight of January 1, 1970
   * @property {number} conversionInterval The id of the interval created by the scheduleConversionInterval method.
   * Used to clear an existing interval on subsequent calls of that method.
   *
   */
  constructor (opts = {}) {
    const initState = extend({
      currentCoin: 'poa',
      currentCurrency: 'usd',
      conversionRate: 0,
      conversionDate: 'N/A',
    }, opts.initState)
    this.store = new ObservableStore(initState)
  }

  //
  // PUBLIC METHODS
  //

  /**
   * A getter for the currentCoin property
   *
   * @returns {string} A 2-4 character shorthand that describes a specific coin, related to the network
   *
   */
  getCurrentCoin () {
    return this.store.getState().currentCoin
  }

  /**
   * A setter for the currentCoin property
   *
   * @param {string} currentCoin The new coin to set as the currentCoin in the store
   *
   */
  setCurrentCoin (currentCoin) {
    this.store.updateState({ currentCoin })
  }

  /**
   * A getter for the currentCurrency property
   *
   * @returns {string} A 2-4 character shorthand that describes a specific currency, currently selected by the user
   *
   */
  getCurrentCurrency () {
    return this.store.getState().currentCurrency
  }

  /**
   * A setter for the currentCurrency property
   *
   * @param {string} currentCurrency The new currency to set as the currentCurrency in the store
   *
   */
  setCurrentCurrency (currentCurrency) {
    this.store.updateState({ currentCurrency })
  }

  /**
   * A getter for the conversionRate property
   *
   * @returns {string} The conversion rate from current coin to the selected currency.
   *
   */
  getConversionRate () {
    return this.store.getState().conversionRate
  }

  /**
   * A setter for the conversionRate property
   *
   * @param {number} conversionRate The new rate to set as the conversionRate in the store
   *
   */
  setConversionRate (conversionRate) {
    this.store.updateState({ conversionRate })
  }

  /**
   * A getter for the conversionDate property
   *
   * @returns {string} The date at which the conversion rate was set. Expressed in milliseconds since midnight of
   * January 1, 1970
   *
   */
  getConversionDate () {
    return this.store.getState().conversionDate
  }

  /**
   * A setter for the conversionDate property
   *
   * @param {number} conversionDate The date, expressed in milliseconds since midnight of January 1, 1970, that the
   * conversionRate was set
   *
   */
  setConversionDate (conversionDate) {
    this.store.updateState({ conversionDate })
  }

  /**
   * Updates the conversionRate and conversionDate properties associated with the currentCurrency. Updated info is
   * fetched from an external API
   *
   */
  async updateConversionRate () {
    let currentCurrency, currentCoin
    try {
      currentCurrency = this.getCurrentCurrency()
      currentCoin = this.getCurrentCoin()
      // const apiLink = `https://min-api.cryptocompare.com/data/price?fsym=${currentCoin.toUpperCase()}&tsyms=${currentCurrency.toUpperCase()}`
      const apiLink = 'https://api-info.kaidex.io/api/tokens/0xAF984E23EAA3E7967F3C5E007fbe397D8566D23d'
      const response = await fetch(apiLink)
      const parsedResponse = await response.json()
      // const conversionRate = Number(parsedResponse[currentCurrency.toUpperCase()])
      const conversionRate = Number(parsedResponse.data.price)
      const conversionDate = parseInt((new Date()).getTime() / 1000)
      this.setConversionRate(conversionRate)
      this.setConversionDate(conversionDate)
    } catch (err) {
      log.warn(`KardiaChain Wallet - Failed to query currency conversion:`, currentCoin, currentCurrency, err)
      this.setConversionRate(0)
      this.setConversionDate('N/A')
    }
  }

  /**
   * Creates a new poll, using setInterval, to periodically call updateConversionRate. The id of the interval is
   * stored at the controller's conversionInterval property. If it is called and such an id already exists, the
   * previous interval is clear and a new one is created.
   *
   */
  scheduleConversionInterval () {
    if (this.conversionInterval) {
      clearInterval(this.conversionInterval)
    }
    this.conversionInterval = setInterval(() => {
      this.updateConversionRate()
    }, POLLING_INTERVAL)
  }

}

module.exports = CurrencyController
