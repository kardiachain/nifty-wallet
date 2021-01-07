import React, {Component} from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import actions from '../../../../ui/app/actions'

class SendHeader extends Component {
	static propTypes = {
		back: PropTypes.func,
		dispatch: PropTypes.func,
		address: PropTypes.string,
		title: PropTypes.string,
	}

	render () {
		return (
			<h3
				className="flex-center send-header"
				style={{
					marginTop: '14px',
					marginBottom: '14px',
					fontSize: '18px',
					fontFamily: 'Work Sans, sans-serif',
					color: '#1C1C28',
					fontWeight: 'bold',
					lineHeight: '24px',
				}}
			>
				<i
					className="fa fa-arrow-left fa-lg cursor-pointer"
					style={{
						position: 'absolute',
						left: '30px',
					}}
					onClick={() => { this.props.back ? this.props.back() : this.back() }}
				/>
				{ this.props.title }
			</h3>
		)
	}

	back () {
		const address = this.props.address
		this.props.dispatch(actions.backToAccountDetail(address))
	}
}

function mapStateToProps (state) {
	const result = {
		address: state.metamask.selectedAddress,
	}

	return result
}

module.exports = connect(mapStateToProps)(SendHeader)
