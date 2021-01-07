const Component = require('react').Component
const h = require('react-hyperscript')
const inherits = require('util').inherits

const TransactionListItem = require('./transaction-list-item')
// const { MAINNET_CODE } = require('../../../app/scripts/controllers/network/enums')

module.exports = TransactionList


inherits(TransactionList, Component)
function TransactionList () {
  Component.call(this)
}

TransactionList.prototype.render = function () {
  const { transactions, network, conversionRate } = this.props

  // let shapeShiftTxList
  // if (Number(network) === MAINNET_CODE) {
    // shapeShiftTxList = this.props.shapeShiftTxList
  // }
  // const txsToRender = !shapeShiftTxList ? transactions.concat(unapprovedMsgs) : transactions.concat(unapprovedMsgs, shapeShiftTxList)
  // .sort((a, b) => b.time - a.time)

  const txsToRender = transactions

  return (

    h('section.transaction-list.full-flex-height', {
      style: {
        justifyContent: 'center',
      },
    }, [

      h('style', `
        .transaction-list .transaction-list-item:not(:last-of-type) {
          border-bottom: 1px solid #D4D4D4;
        }
        .transaction-list .transaction-list-item .ether-balance-label {
          display: block !important;
          font-size: small;
        }
      `),

      h('.tx-list', {
        style: {
          overflowY: 'auto',
          height: '100%',
          textAlign: 'center',

        },
      }, [

        txsToRender.length
          ? txsToRender.map((transaction, i) => {
            let key
            switch (transaction.key) {
              case 'shapeshift':
                const { depositAddress, time } = transaction
                key = `shift-tx-${depositAddress}-${time}-${i}`
                break
              default:
                key = `tx-${transaction.id}-${i}`
            }
            return h(TransactionListItem, {
              transaction, i, network, key,
              conversionRate, transactions,
              showTx: (txId) => {
                this.props.viewPendingTx(txId)
              },
            })
          })
        : h('.flex-center.full-flex-height', {
          style: {
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundImage: 'url("./images/no-tx.png")',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            marginTop: '80px',
            width: '100%',
            height: '174px',
          },
        }, [
          h('p', {
            style: {
              // margin: '50px 0',
              fontWeight: 600,
              fontSize: '14px',
              lineHeight: '16px',
              color: 'rgba(28, 28, 40, 0.54)',
              position: 'absolute',
              bottom: '2%',
            },
          }, 'No transaction history.'),
        ]),
      ]),
    ])
  )
}

