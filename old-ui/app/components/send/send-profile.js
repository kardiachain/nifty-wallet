import React, { Component } from 'react'
import { connect } from 'react-redux'
import Identicon from '../identicon'
import { addressSummary } from '../../util'
import EthBalance from '../eth-balance'
import TokenBalance from '../token-balance'
import { getMetaMaskAccounts } from '../../../../ui/app/selectors'
import PropTypes from 'prop-types'

class SendProfile extends Component {
	static propTypes = {
		address: PropTypes.string,
		account: PropTypes.object,
		identity: PropTypes.object,
		network: PropTypes.string,
		conversionRate: PropTypes.number,
		currentCurrency: PropTypes.string,
		isToken: PropTypes.bool,
		token: PropTypes.any,
	}

	render() {
		const props = this.props
		const {
			address,
			account,
			identity,
			network,
			conversionRate,
			currentCurrency,
			isToken,
			token,
		} = props
		return (
			<div className="account-data-subsection">
				<div style={{display:'flex'}}>
					<div
						className="identicon-wrapper flex-column flex-center select-none"
					>
						<Identicon diameter={40} address={address} />
					</div>

					{/* address */}
					<div class="address" style={{marginLeft:'12px'}}>
					<h2
						className="send-profile-identity-name"
						style={{
							fontWeight: '600',
							lineHeight: '24px',
							color: '#1C1C28'
						}}
					>{identity && identity.name}</h2>
					<div
						className="flex-row flex-center"
						style={{
							color: '#333333',
						}}
					>
						<div className="send-profile-address" style={{ 
							fontSize: '14px',
							fontWeight: '600',
							lineHeight: '20px',
							color: 'rgba(28, 28, 40, 0.26)',
							}}>
							{addressSummary(network, address)}
						</div>
					</div>
					</div>


				</div>

				{/* balance */}
				<div 
				style={{
					background: '#FFFFFF',
					boxShadow: '0px 0px 2px rgba(40, 41, 61, 0.04), 0px 4px 8px rgba(96, 97, 112, 0.16)',
					borderRadius: '8px',
					padding: '12px',
					display: 'flex',
					margin: '16px 0px'
				}}
				>
					{isToken ? <TokenBalance token={token} /> : <EthBalance {...{
						value: account && account.balance,
						conversionRate,
						currentCurrency,
						network,
					}} />}
				</div>
			</div>
		)
	}
}

function mapStateToProps(state) {
	const accounts = getMetaMaskAccounts(state)
	const result = {
		address: state.metamask.selectedAddress,
		accounts,
		identities: state.metamask.identities,
		network: state.metamask.network,
		conversionRate: state.metamask.conversionRate,
		currentCurrency: state.metamask.currentCurrency,
	}

	result.account = result.accounts[result.address]
	result.identity = result.identities[result.address]

	return result
}

module.exports = connect(mapStateToProps)(SendProfile)
