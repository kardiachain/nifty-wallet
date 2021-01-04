const valuesFor = require('../app/util').valuesFor

module.exports = function (unapprovedTxs, unapprovedMsgs, personalMsgs, typedMessages, network) {

  const txValues = network ? valuesFor(unapprovedTxs).filter(txMeta => txMeta.metamaskNetworkId === network) : valuesFor(unapprovedTxs)

  const msgValues = valuesFor(unapprovedMsgs)
  let allValues = txValues.concat(msgValues)

  const personalValues = valuesFor(personalMsgs)
  allValues = allValues.concat(personalValues)

  const typedValues = valuesFor(typedMessages)
  allValues = allValues.concat(typedValues)

  allValues = allValues.sort((a, b) => {
    return a.time > b.time
  })

  return allValues
}
