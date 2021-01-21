const Component = require('react').Component
const h = require('react-hyperscript')
const inherits = require('util').inherits
const connect = require('react-redux').connect

const EthBalance = require('./eth-balance')
const addressSummary = require('../util').addressSummary
const CopyButton = require('./copy/copy-button')
const vreme = new (require('vreme'))()
const Tooltip = require('./tooltip')
const actions = require('../../../ui/app/actions')
const ShiftListItem = require('./shift-list-item')

const {
  KARDIA_MAINNET_CODE,
} = require('../../../app/scripts/controllers/network/enums')
const { EXPLORER_ENDPOINT } = require('../../../constant')

const mapDispatchToProps = dispatch => {
  return {
    retryTransaction: transactionId => dispatch(actions.retryTransaction(transactionId)),
  }
}

module.exports = connect(null, mapDispatchToProps)(TransactionListItem)

inherits(TransactionListItem, Component)
function TransactionListItem () {
  Component.call(this)
}

TransactionListItem.prototype.render = function () {
  const { transaction, network, conversionRate, currentCurrency } = this.props
  const yourAddress = this.props.address
  const incoming = this.props.address.toLowerCase() === transaction.to.toLowerCase()
  const { status } = transaction
  if (transaction.key === 'shapeshift') {
    if (Number(network) === KARDIA_MAINNET_CODE) return h(ShiftListItem, transaction)
  }
  const date = formatDate(transaction.time)

  let isLinkable = false
  const numericNet = isNaN(network) ? network : parseInt(network)
  isLinkable = numericNet === KARDIA_MAINNET_CODE

  const isMsg = ('msgParams' in transaction)
  const isTx = (transaction.contractAddress === '0x')
  const isPending = status === 'unapproved'
  const txParams = transaction
  // if (isTx) {
  //   txParams = transaction
  // } else if (isMsg) {
  //   txParams = transaction.msgParams
  // }

  // const nonce = txParams.nonce ? numberToBN(txParams.nonce).toString(10) : ''

  const isClickable = ('hash' in transaction && isLinkable) || isPending
  const valueStyle = {
    fontFamily: 'Nunito Bold',
    width: '100%',
    textAlign: 'right',
    fontSize: '14px',
    color: '#333333',
  }

  const dimStyle = {
    fontFamily: 'Nunito Regular',
    color: '#333333',
    marginLeft: '5px',
    fontSize: '14px',
  }
  return (
    h('.transaction-list-item.flex-column', {
      onClick: (event) => {
        if (isPending) {
          this.props.showTx(transaction.id)
        }
        event.stopPropagation()
        if (!transaction.hash || !isLinkable) return
        const url = `${EXPLORER_ENDPOINT}/tx/${transaction.hash}`
        global.platform.openWindow({ url })
      },
      style: {
        padding: '15px 0 5px 0',
        alignItems: 'center',
      },
    }, [
      h(`.flex-row.flex-space-between${isClickable ? '.pointer' : ''}`, {
        style: {
          width: '100%',
          alignItems: 'center',
        },
      }, [
        h('.flex-column', {
          style: {
            textAlign: 'left',
          },
        }, [
          h('div.flex-row', [
            recipientField(txParams, transaction, isTx, isMsg, network, yourAddress),
          ]),
          h('div', {
            style: {
              fontSize: '12px',
              color: '#777777',
            },
          }, date),
        ]),
        h(EthBalance, {
          valueStyle,
          dimStyle,
          value: txParams.value ? txParams.value : 0,
          conversionRate,
          currentCurrency,
          width: '55px',
          shorten: true,
          showFiat: false,
          network,
          incoming: incoming,
          style: {
          },
        }),
      ]),
    ])
  )
}

TransactionListItem.prototype.resubmit = function () {
  const { transaction } = this.props
  this.props.retryTransaction(transaction.id)
}

function recipientField (txParams, transaction, isTx, isMsg, network, yourAddress) {
  const message = addressSummary(network, transaction.hash)
  // console.log('Address', this.props.address)

  // if (transaction.to === '0x' && transaction.toName === '') {
  //   message = 'Contract creation'
  // // } else if (txParams.to) {
  // } else if (transaction.to) {
  //   // message = addressSummary(network, txParams.to)
  //   message = addressSummary(network, transaction.to)
  // } else {
  //   message = 'Contract Deployment'
  // }

  return h('div', {
    style: {
      fontSize: '14px',
      color: '#333333',
    },
  }, [
    h('span', (!transaction.hash ? {style: {whiteSpace: 'nowrap'}} : null), message),
    // h('span', (!transaction.hash ? {style: {whiteSpace: 'nowrap'}} : null), transaction.hash),
    // Places a copy button if tx is successful, else places a placeholder empty div.
    transaction.hash ? h(CopyButton, { value: transaction.hash, display: 'inline' }) : h('div', {style: { display: 'flex', alignItems: 'center', width: '26px' }}),
    renderErrorOrWarning(transaction, network),
  ])
}

function formatDate (date) {
  return vreme.format(new Date(date), 'March 16 2014 14:30')
}

function renderErrorOrWarning (transaction, network) {
  const { status, err, warning } = transaction

  // show dropped
  if (status === 'dropped') {
    return h('div', ' (Dropped)')
  }

  // show rejected
  if (status === 'rejected') {
    return h('div', ' (Rejected)')
  }

  // show error
  if (err) {
    const message = err.message || ''
    return (
        h(Tooltip, {
          title: message,
          position: 'bottom',
          id: 'transactionListErrorItem',
        }, [
          h(`div`, {
            'data-tip': '',
            'data-for': 'transactionListErrorItem',
          }, ` (Failed)`),
        ])
    )
  }

  // show warning
  if (warning || (
      warning &&
      !warning.error.includes('[ethjs-rpc] rpc error with payload') &&
      !warning.error.includes('[ethjs-query] while formatting outputs from rpc')
      )
    ) {
    const message = warning.message
    return h(Tooltip, {
      title: message,
      position: 'bottom',
    }, [
      h(`div`, ` (Warning)`),
    ])
  }
}
