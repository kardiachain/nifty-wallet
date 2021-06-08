const Component = require('react').Component
const h = require('react-hyperscript')
const inherits = require('util').inherits
const formatBalance = require('../util').formatBalance
const generateBalanceObject = require('../util').generateBalanceObject
const Tooltip = require('./tooltip.js')
const FiatValue = require('./fiat-value.js')
const BigNumber = require('bignumber.js').default

const fmt = {
  prefix: '',
  decimalSeparator: '.',
  groupSeparator: ',',
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSeparator: ' ',
  fractionGroupSize: 0,
  suffix: ''
}
BigNumber.config({ FORMAT: fmt })

module.exports = EthBalanceComponent

inherits(EthBalanceComponent, Component)
function EthBalanceComponent () {
  Component.call(this)
}

EthBalanceComponent.prototype.render = function () {
  const props = this.props
  let { value } = props
  const { style, width, network, isToken, tokenSymbol } = props
  const needsParse = this.props.needsParse !== undefined ? this.props.needsParse : true
  value = value ? formatBalance(value, 6, needsParse, network, isToken, tokenSymbol) : '...'

  return (

    h('.ether-balance.ether-balance-amount', {
      style,
    }, [
      h('div', {
        style: {
          display: 'inline',
          width,
        },
      }, this.renderBalance(value)),
    ])

  )
}
EthBalanceComponent.prototype.renderBalance = function (value) {
  const props = this.props
  const { conversionRate, shorten, incoming, currentCurrency } = props
  if (value === 'None') return value
  if (value === '...') return value
  const balanceObj = generateBalanceObject(value, shorten ? 1 : 3)
  let balance
  const splitBalance = value.split(' ')
  const ethNumber = splitBalance[0]
  const ethSuffix = splitBalance[1]
  const showFiat = 'showFiat' in props ? props.showFiat : true

  if (shorten) {
    balance = balanceObj.shortBalance
  } else {
    balance = balanceObj.balance
  }

  const { label } = balanceObj
  const valueStyle = props.valueStyle ? props.valueStyle : {
    color: 'rgba(28, 28, 40, 1)',
    fontWeight: '600',
    width: '100%',
    fontSize: props.fontSize || '15px',
    textAlign: 'right',
  }
  const dimStyle = props.dimStyle ? props.dimStyle : {
    color: 'rgba(28, 28, 40, 1)',
    fontSize: props.fontSize || '15px',
    marginLeft: '5px',
  }

  const formattedBalance = new BigNumber(balance).toFormat()

  return (
    h(Tooltip, {
      title: `${ethNumber} ${ethSuffix}`,
      position: 'bottom',
      id: 'ethBalance',
    }, h('div.flex-column', [
      h('.flex-row', {
        style: {
          alignItems: 'flex-end',
          lineHeight: '20px',
          textRendering: 'geometricPrecision',
        },
        'data-tip': '',
        'data-for': 'ethBalance',
      }, [
        h('div', {
          style: valueStyle,
        }, incoming ? `+${formattedBalance}` : formattedBalance),
        h('div', {
          style: dimStyle,
        }, label),
      ]),

      showFiat ? h(FiatValue, { valueStyle, dimStyle, value: props.value, conversionRate, currentCurrency, network: props.network }) : null,
    ]))
  )
}
