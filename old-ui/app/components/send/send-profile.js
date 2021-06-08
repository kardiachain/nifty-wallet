import React, {Component} from 'react'
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

	render () {
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
			<div
				className="account-data-subsection"
				style={{
					// background: 'linear-gradient(rgb(84, 36, 147), rgb(104, 45, 182))',
					background: 'transparent',
					paddingLeft: '14px',
					paddingRight: '14px'
				}}
			>
				{/* header - identicon + nav */}
				<div className="flex-row">
					<div className="flex-column flex-center" style={{marginRight: 12}}>
						{/* large identicon*/}
						<div
						className="identicon-wrapper flex-column flex-center select-none"
						style={{ display: 'inline-block' }}
						>
							<Identicon diameter={44} address={address} />
						</div>
						{/* invisible place holder */}
						{/* <i className="fa fa-users fa-lg invisible" style={{ marginTop: '28px' }} /> */}
					</div>
					{/* account label */}
					<div className="flex-column" style={{ alignItems: 'flex-start' }} >
						<h2
							className="send-profile-identity-name font-medium flex-center"
							style={{
								// color: '#ffffff',
								paddingTop: '8px',
								marginBottom: '8px',
								fontWeight: '600'
							}}
						>{identity && identity.name}</h2>
						{/* address and getter actions */}
						<div
							className="flex-row flex-center"
							style={{
								color: 'rgba(28, 28, 40, 0.26)',
								// marginBottom: '30px',
							}}
						>
							<div className="send-profile-address" style={{ lineHeight: '16px', fontSize: '14px' }}>
								{addressSummary(network, address)}
							</div>
						</div>
					</div>
				</div>
				{/* balance */}
				<div 
					className="flex-row flex-start"
					style={{
						background: 'rgb(255, 255, 255)',
						boxShadow: 'rgb(40 41 61 / 4%) 0px 0px 2px, rgb(96 97 112 / 16%) 0px 4px 8px',
						borderRadius: 8,
						padding: 12,
						marginTop: 8
					}}
				>
					{isToken ? <TokenBalance token={token} /> : <EthBalance {...{
						value: account && account.balance,
						conversionRate,
						currentCurrency,
						network,
						showFiat: false
					}} />}
				</div>
			</div>
		)
	}
}

function mapStateToProps (state) {
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
