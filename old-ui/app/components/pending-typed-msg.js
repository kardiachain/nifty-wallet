import React, { Component } from 'react'
import PendingTxDetails from './pending-typed-msg-details'
import PropTypes from 'prop-types'

export default class PendingMsg extends Component {
  static propTypes = {
    txData: PropTypes.object,
    cancelTypedMessage: PropTypes.func,
    signTypedMessage: PropTypes.func,
  }

  render () {
    const state = this.props
    const msgData = state.txData

    return (
      <div key={msgData.id} style={{height: '100%'}}>
        <h3 style={{
          fontWeight: 'bold',
          textAlign: 'center',
          color: 'black',
          margin: '20px',
        }}>Sign message</h3>
        <PendingTxDetails {...state}/>
        <div className="flex-row flex-space-around" style={{
          marginRight: '30px',
          float: 'right',
          display: 'block',
        }}>
          <button style={{marginRight: '10px'}} onClick={state.cancelTypedMessage}>Cancel</button>
          <button onClick={state.signTypedMessage}>Sign</button>
        </div>
      </div>
    )
  }
}
