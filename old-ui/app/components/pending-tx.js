const Component = require('react').Component
const h = require('react-hyperscript')
const actions = require('../../../ui/app/actions')
import PropTypes from 'prop-types'
import clone from 'clone'
import ethUtil from 'ethereumjs-util'
const BN = ethUtil.BN

const util = require('../util')
const MiniAccountPanel = require('./mini-account-panel')
const Copyable = require('./copy/copyable')
const KAIBalance = require('./eth-balance')
const { addressSummary, accountSummary, toChecksumAddress } = util
const nameForAddress = require('../../lib/contract-namer')
const BNInput = require('./bn-as-decimal-input')
const { getEnvironmentType } = require('../../../app/scripts/lib/util')
const NetworkIndicator = require('../components/network')
const { ENVIRONMENT_TYPE_NOTIFICATION } = require('../../../app/scripts/lib/enums')
import { connect } from 'react-redux'
import abiDecoder from 'abi-decoder'
const { tokenInfoGetter, calcTokenAmount } = require('../../../ui/app/token-util')
import BigNumber from 'bignumber.js'
import { getMetaMaskAccounts } from '../../../ui/app/selectors'
import { MIN_GAS_LIMIT_DEC, MIN_GAS_PRICE_DEC } from '../../../ui/app/components/send/send.constants'
import * as Toast from './toast'
import { getNetworkCoinName } from '../../../app/scripts/controllers/network/enums'

const MIN_GAS_PRICE_BN = new BN(MIN_GAS_PRICE_DEC)
const MIN_GAS_LIMIT_BN = new BN(MIN_GAS_LIMIT_DEC)
const emptyAddress = '0x0000000000000000000000000000000000000000'

class PendingTx extends Component {
  static propTypes = {
    network: PropTypes.string,
    buyEth: PropTypes.func,
    cancelTransaction: PropTypes.func,
    cancelAllTransactions: PropTypes.func,
    sendTransaction: PropTypes.func,
    actions: PropTypes.object,
    txData: PropTypes.object,
    selectedAddress: PropTypes.string,
    identities: PropTypes.object,
    accounts: PropTypes.object,
    isToken: PropTypes.bool,
    isUnlocked: PropTypes.bool,
    currentCurrency: PropTypes.string,
    conversionRate: PropTypes.number,
    provider: PropTypes.object,
    index: PropTypes.number,
    blockGasLimit: PropTypes.string,
    tokensToSend: PropTypes.objectOf(BigNumber),
    tokensTransferTo: PropTypes.string,
    unapprovedTxs: PropTypes.object,
    txId: PropTypes.string,
  }

  constructor (opts = {}) {
    super()
    this.state = {
      valid: true,
      txData: null,
      submitting: false,
      token: {
        address: emptyAddress,
        symbol: '',
        decimals: 0,
        dataRetrieved: false,
      },
      isToken: false,
      coinName: getNetworkCoinName(opts.network),
    }
    this.tokenInfoGetter = tokenInfoGetter()
  }

  render () {
    const props = this.props
    if (props.isToken || this.state.isToken) {
      if (!this.state.token.dataRetrieved) return null
    }
    const { currentCurrency, blockGasLimit, network, provider, isUnlocked } = props

    const conversionRate = props.conversionRate
    const txMeta = this.gatherTxMeta()
    const txParams = txMeta.txParams || {}
    let { isToken, tokensToSend, tokensTransferTo } = props

    const decodedData = txParams.data && abiDecoder.decodeMethod(txParams.data)
    if (decodedData && decodedData.name === 'transfer') {
      isToken = true
      const tokenValBN = new BigNumber(calcTokenAmount(decodedData.params[1].value, this.state.token.decimals))
      const multiplier = Math.pow(10, 18)
      // tokensToSend = tokenValBN.mul(multiplier).toString(16)
      tokensToSend = tokenValBN.mul(multiplier)
      tokensTransferTo = decodedData.params[0].value
    }

    // Allow retry txs
    const { lastGasPrice } = txMeta
    let forceGasMin
    if (lastGasPrice) {
      const stripped = ethUtil.stripHexPrefix(lastGasPrice)
      const lastGas = new BN(stripped, 16)
      const priceBump = lastGas.divn('10')
      forceGasMin = lastGas.add(priceBump)
    }

    // Account Details
    const address = txParams.from || props.selectedAddress
    const identity = props.identities[address] || { address: address }
    const account = props.accounts[address]
    const balance = account ? new BN(account.balance) : new BN('0')

    // recipient check
    const isValidAddress = !txParams.to || util.isValidAddress(txParams.to, network)

    // Gas
    const gasBn = txParams.gas ? new BN(txParams.gas) : MIN_GAS_LIMIT_BN
    // default to 8MM gas limit
    const gasLimit = new BN(parseInt(blockGasLimit) || '8000000')
    const safeGasLimitBN = this.bnMultiplyByFraction(gasLimit, 99, 100)
    const saferGasLimitBN = this.bnMultiplyByFraction(gasLimit, 98, 100)
    const safeGasLimit = safeGasLimitBN.toString(10)

    // Gas Price
    const gasPrice = txParams.gasPrice || MIN_GAS_PRICE_BN
    const gasPriceBn = gasPrice

    const txFeeBn = gasBn.mul(gasPriceBn)
    const valueBn = txParams.value ? new BN(txParams.value) : new BN('0')
    const maxCost = txFeeBn.add(valueBn)

    const txData = txParams.data
    // const dataLength = txParams.data ? (txParams.data.length - 2) / 2 : 0

    const { totalTx, positionOfCurrentTx, nextTxId, prevTxId, showNavigation } = this.getNavigateTxData()

    const balanceBn = balance
    const insufficientBalance = balanceBn.lt(maxCost)
    const dangerousGasLimit = gasBn.gte(saferGasLimitBN)
    const gasLimitSpecified = txMeta.gasLimitSpecified
    const buyDisabled = insufficientBalance || !this.state.valid || !isValidAddress || this.state.submitting

    const isNotification = getEnvironmentType(window.location.href) === ENVIRONMENT_TYPE_NOTIFICATION

    this.inputs = []

    const valueStyle = {
      fontFamily: 'Nunito Bold',
      width: '100%',
      textAlign: 'right',
      fontSize: '14px',
      color: '#333333',
    }

    const dimStyle = {
      marginLeft: '8px',
      fontWeight: 600,
      fontSize: '15px',
      lineHeight: '20px',
      color: '#1C1C28',
    }


    const isError = txMeta.simulationFails || !isValidAddress || insufficientBalance || (dangerousGasLimit && !gasLimitSpecified)
    return (

      h('div', {
        key: txMeta.id,
      }, [
        h(Toast.ToastComponent, {
          type: Toast.TOAST_TYPE_ERROR,
        }),

        h('.flex-row.flex-center', {
          style: {
            margin: '14px 0px 24px 0px',
            fontWeight: 'bold',
            fontSize: '18px',
            lineHeight: '24px',
            color: '#1C1C28',
            fontFamily: 'Work Sans, sans-serif',
          },
}, [
  !isNotification ? h('i.fa.fa-arrow-left.fa-lg.cursor-pointer', {
    onClick: this.goHome.bind(this),
    style: {
      position: 'absolute',
      left: '20px',
      width: '16px',
      height: '16px',
    },
  }) : null,
  'Confirm Transaction',
  isNotification ? h(NetworkIndicator, {
    network: network,
    provider: provider,
    isUnlocked: isUnlocked,
  }) : null,
]),


h('form#pending-tx-form', {
  onSubmit: this.onSubmit.bind(this),

}, [

  // tx info
  h('div', [

    h('.flex-row.flex-center', {
      style: {
        position: 'relative',
        background: '#FFFFFF',
        boxShadow: '0px 0px 2px rgba(40, 41, 61, 0.04), 0px 4px 8px rgba(96, 97, 112, 0.16)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px',
      },
    }, [

      h('div', {
        style: {
          position: 'absolute',
          bottom: '20px',
          width: '100%',
          textAlign: 'center',
          color: '#333333',
        },
      }, [
        h('h3', {
          style: {
            alignSelf: 'center',
            display: showNavigation ? 'block' : 'none',
            fontSize: '14px',
          },
        }, [
          h('i.fa.white-arrow-left.fa-lg.cursor-pointer', {
            style: {
              display: positionOfCurrentTx === 1 ? 'none' : 'inline-block',
            },
            onClick: () => props.actions.nextTx(prevTxId),
          }),
          ` ${positionOfCurrentTx} of ${totalTx} `,
          h('i.fa.white-arrow-right.fa-lg.cursor-pointer', {
            style: {
              display: positionOfCurrentTx === totalTx ? 'none' : 'inline-block',
            },
            onClick: () => props.actions.nextTx(nextTxId),
          }),
        ])],
      ),

      // h(MiniAccountPanel, {
      // imageSeed: address,
      // picOrder: 'left',
      // }, [
      h('div', {
        style: {
          // marginLeft: '10px',
        },
      }, [
        h('div.font-pre-medium', {
          style: {
            fontWeight: 600,
            fontSize: '15px',
            lineHeight: '20px',
            color: '#1C1C28',
          },
        }, accountSummary(identity.name, 6, 4)),

        h(Copyable, {
          value: toChecksumAddress(network, address),
        }, [
          h('span.font-small', {
            style: {
              fontWeight: 600,
              fontSize: '12px',
              lineHeight: '20px',
              color: 'rgba(28, 28, 40, 0.26)',
            },
          }, addressSummary(network, address, 6, 4, false)),
        ]),
      ]),

      forwardCarrat(),

      this.miniAccountPanelForRecipient(isToken, tokensTransferTo),
    ]),

    h('style', `
              .table-box {
                margin: 7px 0px 0px 0px;
                width: 100%;
                position: relative;
              }

              .table-box .row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom:16px;
              }

              .cell.label{
                font-weight: 600;
                font-size: 15px;
                line-height: 20px;
                font-family: "Work Sans", sans-serif;
                color: rgba(28, 28, 40, 0.54);
              }

            `),

    h('.table-box', [

      isError ? h('div', {
        style: {
          textAlign: 'center',
          position: 'absolute',
          bottom: '-30%',
          width: '100%',
        },
      }, [
        txMeta.simulationFails ?
          h('.error', {
            style: {
              fontSize: '12px',
            },
          }, 'Transaction Error. Exception thrown in contract code.')
          : null,

        !isValidAddress ?
          h('.error', {
            style: {
              fontSize: '12px',
            },
          }, 'Recipient address is invalid. Sending this transaction will result in a loss of ETH. ')
          : null,

        insufficientBalance ?
          h('.error', {
            style: {
              fontSize: '12px',
            },
          }, 'Insufficient balance for transaction. ')
          : null,

        (dangerousGasLimit && !gasLimitSpecified) ?
          h('.error', {
            style: {
              fontSize: '12px',
            },
          }, 'Gas limit set dangerously high. Approving this transaction is liable to fail. ')
          : null,
      ]) : null,

      // Ether Value
      // Currently not customizable, but easily modified
      // in the way that gas and gasLimit currently are.
      h('.row', [
        h('.cell.label', 'Amount'),
        h(KAIBalance, {
          valueStyle,
          dimStyle,
          value: isToken ? tokensToSend/* (new BN(tokensToSend)).mul(1e18)*/ : txParams.value,
          currentCurrency,
          conversionRate,
          network,
          isToken,
          tokenSymbol: this.state.token.symbol,
          showFiat: !isToken,
        }),
      ]),

      // Gas Limit (customizable)
      h('.cell.row', [
        h('.cell.label', 'Gas Limit'),
        h('.cell.value', {
        }, [
          h(BNInput, {
            id: 'gas_limit',
            name: 'Gas Limit',
            value: gasBn,
            precision: 0,
            scale: 0,
            // The hard lower limit for gas.
            min: MIN_GAS_LIMIT_BN,
            max: safeGasLimit,
            suffix: 'UNITS',
            style: {
              position: 'relative',
              width: '80px',
            },
            onChange: this.gasLimitChanged.bind(this),

            ref: (hexInput) => { this.inputs.push(hexInput) },
          }),
        ]),
      ]),

      // Gas Price (customizable)
      h('.cell.row', [
        h('.cell.label', 'Gas Price'),
        h('.cell.value', {
        }, [
          h(BNInput, {
            id: 'gas_price',
            name: 'Gas Price',
            value: gasPriceBn,
            precision: 9,
            scale: 0,
            suffix: 'OXY',
            min: forceGasMin || MIN_GAS_PRICE_BN,
            style: {
              position: 'relative',
              width: '91px',
            },
            onChange: this.gasPriceChanged.bind(this),
            ref: (hexInput) => { this.inputs.push(hexInput) },
          }),
        ]),
      ]),

      // Max Transaction Fee (calculated)
      h('.cell.row', [
        h('.cell.label', 'Max Transaction Fee'),
        h(KAIBalance, {
          valueStyle,
          dimStyle,
          value: txFeeBn,
          currentCurrency,
          conversionRate,
          network,
        }),
      ]),

      h('.cell.row', {
        style: {
          // fontFamily: 'Nunito Regular',
        },
      }, [
        h('.cell.label', 'Max Total'),
        h('.cell.value', {
          style: {
            display: 'flex',
            alignItems: 'center',
          },
        }, [
          h(KAIBalance, {
            valueStyle,
            dimStyle,
            value: maxCost,
            currentCurrency,
            conversionRate,
            inline: true,
            network,
            labelColor: 'black',
            fontSize: '16px',
          }),
        ]),
      ]),
      // Transaction data
      txData ? h('.cell.row', [
        h('.cell.label', 'Data'),
        h('.cell.label', {
          style: {
            overflowX: 'auto',
            width: '50%',
            textAlign: 'right',
          },
        }, txData),
      ]) : null,
    ]), // End of Table

  ]),

  h('style', `
            .conf-buttons button {
            }
          `),

  // send + cancel
  h('.flex-row.flex-space-around.conf-buttons', {
    style: {
      display: 'flex',
      justifyContent: 'center',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: '20px 16px',
      background: '#FFFFFF',
      boxShadow: '0px -4px 8px rgba(0, 0, 0, 0.1)',
      borderRadius: '12px 12px 0px 0px',
    },
  }, [
    // h('button.btn-violet', {
    //   onClick: (event) => {
    //     this.resetGasFields()
    //     event.preventDefault()
    //   },
    //   style: {
    //     marginRight: 0,
    //   },
    // }, 'Reset'),

    // Accept Button or Buy Button
    h('button.cancel.btn-red', {
      // onClick: props.actions.goHome,
      onClick: props.cancelAllTransactions,
    }, 'Reject'),

    insufficientBalance ? h('button.btn-green', { onClick: props.buyEth }, `Buy ${this.state.coinName}`) :
      h('input.confirm', {
        type: 'submit',
        value: 'Submit',
        style: { marginLeft: '10px', flex: 1 },
        disabled: buyDisabled,
      }),
  ]),
  showNavigation ? h('.flex-row.flex-space-around.conf-buttons', {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      margin: '14px 30px',
    },
  }, [
    h('button.cancel.btn-red', {
      onClick: props.cancelAllTransactions,
    }, 'Reject All'),
  ]) : null,
]),
      ])
    )
  }

miniAccountPanelForRecipient (isToken, tokensTransferTo) {
  const props = this.props
  const txData = props.txData
  const txParams = txData.txParams || {}
  const isContractDeploy = !('to' in txParams)
  const to = isToken ? tokensTransferTo : txParams.to
  const isSmcCall = ('data' in txParams) && txParams.data
  // If it's not a contract deploy, send to the account
  if (isContractDeploy) {
    return h(MiniAccountPanel, {
      picOrder: 'right',
    }, [

      h('span.font-small', {
        style: {
          fontFamily: 'Nunito Bold',
          color: '#333333',
        },
      }, 'New Contract'),

    ])
  } else if (isSmcCall) {
    return h(MiniAccountPanel, {
      picOrder: 'right',
    }, [
      h('span.font-small', {
        style: {
          fontFamily: 'Nunito Bold',
          color: '#333333',
        },
      }, 'Smart Contract'),
      h(Copyable, {
        value: toChecksumAddress(props.network, to),
      }, [
        h('span.font-small', {
          style: {
            fontWeight: 600,
            fontSize: '12px',
            lineHeight: '20px',
            color: 'rgba(28, 28, 40, 0.26)',
          },
        }, addressSummary(props.network, to, 6, 4, false)),
      ]),
    ])
  } else {
    return h('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
      },
    }, [
      h('span.font-pre-medium', {
        style: {
          fontWeight: 600,
          fontSize: '15px',
          lineHeight: '20px',
          color: '#1C1C28',
        },
      }, accountSummary(nameForAddress(to, props.identities, props.network)), 6, 4),

      h(Copyable, {
        value: toChecksumAddress(props.network, to),
      }, [
        h('span.font-small', {
          style: {
            fontWeight: 600,
            fontSize: '12px',
            lineHeight: '20px',
            color: 'rgba(28, 28, 40, 0.26)',
          },
        }, addressSummary(props.network, to, 6, 4, false)),
      ]),
    ])
  }
}

componentDidMount () {
  const txMeta = this.gatherTxMeta()
  const txParams = txMeta.txParams || {}
  if (this.props.isToken || this.state.isToken) {
    return this.updateTokenInfo(txParams)
  }
  const decodedData = txParams.data && abiDecoder.decodeMethod(txParams.data)
  if (decodedData && decodedData.name === 'transfer') {
    return this.updateTokenInfo(txParams)
  }
}

componentWillUnmount () {
  this.setState({
    token: {
      address: emptyAddress,
      symbol: '',
      decimals: 0,
      dataRetrieved: false,
    },
    isToken: false,
  })
}

updateTokenInfo = async function (txParams) {
  const tokenParams = await this.tokenInfoGetter(txParams.to)
  this.setState({
    token: {
      address: txParams.to,
      symbol: tokenParams.symbol,
      decimals: tokenParams.decimals,
      dataRetrieved: true,
    },
    isToken: true,
  })
}

gasPriceChanged (newBN, valid) {
  const txMeta = this.gatherTxMeta()
  // txMeta.txParams.gasPrice = '0x' + newBN.toString('hex')
  txMeta.txParams.gasPrice = newBN
  this.setState({
    txData: clone(txMeta),
    valid,
  })
}

gasLimitChanged (newBN, valid) {
  const txMeta = this.gatherTxMeta()
  // txMeta.txParams.gas = '0x' + newBN.toString('hex')
  txMeta.txParams.gas = newBN
  this.setState({
    txData: clone(txMeta),
    valid,
  })
}

resetGasFields () {

  this.inputs.forEach((hexInput) => {
    if (hexInput) {
      hexInput.setValid()
    }
  })

  this.setState({
    txData: null,
    valid: true,
  })
}

async onSubmit (event) {
  event.preventDefault()
  const txMeta = this.gatherTxMeta()
  const valid = this.checkValidity()
  this.setState({ valid, submitting: true })
  // if (valid && this.verifyGasParams()) {
  if (valid) {
    const gas = txMeta.txParams.gas || MIN_GAS_LIMIT_BN
    const gasPrice = txMeta.txParams.gasPrice || MIN_GAS_PRICE_BN
    txMeta.txParams.gas = '0x' + gas.toString(16)
    txMeta.txParams.gasPrice = '0x' + gasPrice.toString(16)

    txMeta.txParams.receiver = txMeta.txParams.to
    delete txMeta.txParams.to

    txMeta.txParams.amount = '0x' + new BN(txMeta.txParams.value).toString(16)
    delete txMeta.txParams.value

    const txObj = txMeta.txParams
    try {
      console.log('Tx Id: ...........', this.props.txId)
      await this.props.actions.signKardiaTx(txObj, this.props.txId)
    } catch (error) {
      this.props.actions.displayWarning(error)
    }
  } else {
    this.props.actions.displayWarning('Invalid Gas Parameters')
    this.setState({ submitting: false })
  }
}

checkValidity () {
  const form = this.getFormEl()
  const valid = form.checkValidity()
  return valid
}

getFormEl () {
  const form = document.querySelector('form#pending-tx-form')
  // Stub out form for unit tests:
  if (!form) {
    return { checkValidity () { return true } }
  }
  return form
}

// After a customizable state value has been updated,
gatherTxMeta () {
  const props = this.props
  const state = this.state

  const txData = clone(state.txData) || clone(props.txData)

  return txData
}

verifyGasParams () {
  // We call this in case the gas has not been modified at all
  if (!this.state) { return true }
  return (
    this._notZeroOrEmptyString(this.state.txData.gas.toString()) &&
    this._notZeroOrEmptyString(this.state.txData.gasPrice.toString())
  )
}

_notZeroOrEmptyString (str) {
  return str !== '' && str !== '0'
}

bnMultiplyByFraction (targetBN, numerator, denominator) {
  const numBN = new BN(numerator)
  const denomBN = new BN(denominator)
  return targetBN.mul(numBN).div(denomBN)
}

goHome (event) {
  this.stopPropagation(event)
  this.props.actions.goHome()
}

stopPropagation (event) {
  if (event.stopPropagation) {
    event.stopPropagation()
  }
}

getNavigateTxData () {
  const { unapprovedTxs, network, txData: { id } = {} } = this.props
  const currentNetworkUnapprovedTxs = Object.keys(unapprovedTxs)
    .filter((key) => unapprovedTxs[key].metamaskNetworkId === network)
    .reduce((acc, key) => ({ ...acc, [key]: unapprovedTxs[key] }), {})
  const enumUnapprovedTxs = Object.keys(currentNetworkUnapprovedTxs)
  const currentPosition = enumUnapprovedTxs.indexOf(id ? id.toString() : '')

  return {
    totalTx: enumUnapprovedTxs.length,
    positionOfCurrentTx: currentPosition + 1,
    nextTxId: enumUnapprovedTxs[currentPosition + 1],
    prevTxId: enumUnapprovedTxs[currentPosition - 1],
    showNavigation: enumUnapprovedTxs.length > 1,
  }
}

}

function forwardCarrat () {
  return (
    h('img', {
      src: 'images/to.png',
      style: {
        padding: '0px 32px',
      },
    })
  )
}

function mapStateToProps (state) {
  const accounts = getMetaMaskAccounts(state)
  const { appState } = state
  const { screenParams } = appState.currentView

  let latestParams = {}
  let txId = ''

  if (screenParams && screenParams.txData) {
    latestParams = screenParams.txData
  } else if (state.metamask.unapprovedTxs && Object.keys(state.metamask.unapprovedTxs).length > 0) {
    const keyArr = Object.keys(state.metamask.unapprovedTxs)
    const latestKey = keyArr[keyArr.length - 1]
    latestParams = state.metamask.unapprovedTxs[latestKey].txParams
    txId = latestKey
    if (typeof latestParams.gas === 'string') {
      latestParams.gas = new BN(parseInt(latestParams.gas, 16))
    }
    if (typeof latestParams.gasPrice === 'string') {
      latestParams.gasPrice = new BN(parseInt(latestParams.gasPrice, 16))
    }
    if (typeof latestParams.value === 'string') {
      latestParams.value = new BN(latestParams.value.replace('0x', ''), 16)
    }
  }

  return {
    identities: state.metamask.identities,
    accounts,
    selectedAddress: state.metamask.selectedAddress,
    unapprovedTxs: state.metamask.unapprovedTxs,
    unapprovedMsgs: state.metamask.unapprovedMsgs,
    unapprovedPersonalMsgs: state.metamask.unapprovedPersonalMsgs,
    unapprovedTypedMessages: state.metamask.unapprovedTypedMessages,
    index: state.appState.currentView.key || 0,
    warning: state.appState.warning,
    network: state.metamask.network,
    provider: state.metamask.provider,
    isUnlocked: state.metamask.isUnlocked,
    conversionRate: state.metamask.conversionRate,
    currentCurrency: state.metamask.currentCurrency,
    blockGasLimit: state.metamask.currentBlockGasLimit,
    computedBalances: state.metamask.computedBalances,
    pendingTxIndex: state.appState.currentView.pendingTxIndex || 0,
    txData: {
      txParams: latestParams,
    },
    txId,
    dPath: state.metamask.dPath,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    actions: {
      nextTx: (txId) => dispatch(actions.nextTx(txId)),
      displayWarning: (msg) => dispatch(actions.displayWarning(msg)),
      goHome: () => dispatch(actions.goHome()),
      signKardiaTx: (txData) => dispatch(actions.signKardiaTx(txData)),
      showLoadingIndication: () => dispatch(actions.showLoadingIndication()),
      hideLoadingIndication: () => dispatch(actions.hideLoadingIndication()),
    },
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(PendingTx)
