const inherits = require('util').inherits
const Component = require('react').Component
const connect = require('react-redux').connect
const { withRouter } = require('react-router-dom')
const { compose } = require('recompose')
const h = require('react-hyperscript')
const actions = require('../../ui/app/actions')
// mascara
const MascaraFirstTime = require('../../mascara/src/app/first-time').default
const MascaraBuyEtherScreen = require('../../mascara/src/app/first-time/buy-ether-screen').default
// init
const InitializeMenuScreen = require('./first-time/init-menu')
const NewKeyChainScreen = require('./new-keychain')
// unlock
const UnlockScreen = require('./unlock')
// accounts
const AccountDetailScreen = require('./account-detail')
const AccountQrScreen = require('./account-qr')
const SendTransactionScreen = require('./components/send/send')
const SendTokenScreen = require('./components/send/send-token')
const SendContractScreen = require('./components/send/send-contract')
const ChooseContractExecutorScreen = require('./components/send/choose-contract-executor')
const ConfirmTxScreen = require('./conf-tx')
// notice
const NoticeScreen = require('./components/notice')
const generateLostAccountsNotice = require('../lib/lost-accounts-notice')
// other views
const ConfigScreen = require('./config')
import AddTokenScreen from './components/add-token'
const ConfirmAddTokenScreen = require('./components/confirm-add-token')
import RemoveTokenScreen from './remove-token'
const AddSuggestedTokenScreen = require('./add-suggested-token')
const Import = require('./accounts/import')
const ForgetDeviceScreen = require('./components/connect-hardware/forget-screen')
import ConnectHardwareForm from './components/connect-hardware/index'
const InfoScreen = require('./info')
const AppBar = require('./components/app-bar/app-bar.component')
const Loading = require('./components/loading')
const BuyView = require('./components/buy-button-subview')
const HDCreateVaultComplete = require('./keychains/hd/create-vault-complete')
const HDRestoreVaultScreen = require('./keychains/hd/restore-vault')
const RevealSeedConfirmation = require('./keychains/hd/recover-seed/confirmation')
const DeleteRpc = require('./components/delete-rpc')
const DeleteImportedAccount = require('./components/delete-imported-account')
const ConfirmChangePassword = require('./components/confirm-change-password')
const { getMetaMaskAccounts } = require('../../ui/app/selectors')
const { getNetworkID } = require('./util')
const { getNetworkDisplayName } = require('../../app/scripts/controllers/network/util')

module.exports = compose(
  withRouter,
  connect(mapStateToProps),
)(App)

inherits(App, Component)
function App () { Component.call(this) }

function mapStateToProps (state) {

  const accounts = getMetaMaskAccounts(state)

  const {
    identities,
    address,
    keyrings,
    isInitialized,
    noActiveNotices,
    seedWords,
    featureFlags,
  } = state.metamask
  const selected = address || Object.keys(accounts)[0]

  return {
    // state from plugin
    isLoading: state.appState.isLoading,
    loadingMessage: state.appState.loadingMessage,
    noActiveNotices: state.metamask.noActiveNotices,
    isInitialized: state.metamask.isInitialized,
    isUnlocked: state.metamask.isUnlocked,
    currentView: state.appState.currentView,
    selectedAddress: state.metamask.selectedAddress,
    transForward: state.appState.transForward,
    isMascara: state.metamask.isMascara,
    isOnboarding: Boolean(!noActiveNotices || seedWords || !isInitialized),
    seedWords: state.metamask.seedWords,
    unapprovedTxs: state.metamask.unapprovedTxs,
    unapprovedMsgs: state.metamask.unapprovedMsgs,
    menuOpen: state.appState.menuOpen,
    network: state.metamask.network,
    dPath: state.metamask.dPath,
    provider: state.metamask.provider,
    forgottenPassword: state.appState.forgottenPassword,
    nextUnreadNotice: state.metamask.nextUnreadNotice,
    lostAccounts: state.metamask.lostAccounts,
    frequentRpcList: state.metamask.frequentRpcList || [],
    featureFlags,
    suggestedTokens: state.metamask.suggestedTokens,

    // state needed to get account dropdown temporarily rendering from app bar
    identities,
    selected,
    keyrings,
  }
}

App.prototype.render = function () {
  const props = this.props
  const {
    currentView,
    isLoading,
    loadingMessage,
    transForward,
    network,
    provider,
  } = props
  const isLoadingNetwork = network === 'loading' && currentView.name !== 'config' && currentView.name !== 'delete-rpc'
  const networkName = provider.type === 'rpc' ? `${this.getNetworkName()} (${provider.rpcTarget})` : this.getNetworkName()
  const loadMessage = loadingMessage || isLoadingNetwork ?
    `Connecting to ${networkName}` : null

  // const confirmMsgTx = (props.currentView.name === 'confTx' && Object.keys(props.unapprovedTxs).length === 0)
  const confirmMsgTx = props.currentView.name === 'confTx'

  const getBGColor = () => {
    if (props.currentView.name === 'confTx') {
      return 'transparent'
    } else if (props.isUnlocked ||
      props.currentView.name === 'restoreVault' ||
      props.currentView.name === 'config') {
        if (confirmMsgTx) {
          return 'linear-gradient(rgb(84, 36, 147), rgb(104, 45, 182))'
        } else {
          return 'white'
        }
    } else {
      return 'transparent'
    }
  }

  return (
    h('.flex-column.full-height', {
      style: {
        // Windows was showing a vertical scroll bar:
        overflow: 'hidden',
        position: 'relative',
        alignItems: 'center',
        background: (props.isUnlocked || props.currentView.name === 'restoreVault' || props.currentView.name === 'config') ? 'white' : '#E5E5E5',
      },
    }, [
      h(AppBar, {
        ...this.props,
      }),
      this.renderLoadingIndicator({ isLoading, isLoadingNetwork, loadMessage }),

      // panel content
      h('.app-primary' + (transForward ? '.from-right' : '.from-left'), {
        style: {
          background: getBGColor(),
          height: (props.isUnlocked && confirmMsgTx) ? '100%' : 'auto',
        },
      }, [
        this.renderPrimary(),
      ]),
    ])
  )
}

App.prototype.renderLoadingIndicator = function ({ isLoading, isLoadingNetwork, loadMessage }) {
  const { isMascara } = this.props

  return isMascara
    ? null
    : h(Loading, {
      isLoading: isLoading || isLoadingNetwork,
      loadingMessage: loadMessage,
    })
}

App.prototype.renderPrimary = function () {
  const props = this.props
  const {isMascara, isOnboarding} = props

  if (isMascara && isOnboarding) {
    return h(MascaraFirstTime)
  }

  // notices
  if (!props.noActiveNotices) {
    return h('div', {
      style: { width: '100%' },
    }, [

      h(NoticeScreen, {
        notice: props.nextUnreadNotice,
        key: 'NoticeScreen',
        onConfirm: () => props.dispatch(actions.markNoticeRead(props.nextUnreadNotice)),
      }),
    ])
  } else if (props.lostAccounts && props.lostAccounts.length > 0) {
    return h(NoticeScreen, {
      notice: generateLostAccountsNotice(props.lostAccounts),
      key: 'LostAccountsNotice',
      onConfirm: () => props.dispatch(actions.markAccountsFound()),
    })
  }

  // show initialize screen
  if (!props.isInitialized || props.forgottenPassword) {
    // show current view
    switch (props.currentView.name) {

      case 'restoreVault':
        return h(HDRestoreVaultScreen, {key: 'HDRestoreVaultScreen'})

      default:
        return h(InitializeMenuScreen, {key: 'menuScreenInit'})
    }
  }

  // show unlock screen
  if (!props.isUnlocked) {
    switch (props.currentView.name) {

      case 'restoreVault':
        return h(HDRestoreVaultScreen, {key: 'HDRestoreVaultScreen'})

      case 'config':
        return h(ConfigScreen, {key: 'config'})

      default:
        return h(UnlockScreen, {key: 'locked'})
    }
  }

  // show seed words screen
  if (props.seedWords) {
    return h(HDCreateVaultComplete, {key: 'HDCreateVaultComplete'})
  }

  // show current view
  switch (props.currentView.name) {

    case 'accountDetail':
      return h(AccountDetailScreen, {key: 'account-detail'})

    case 'sendTransaction':
      return h(SendTransactionScreen, {key: 'send-transaction'})

    case 'sendToken':
      return h(SendTokenScreen, {key: 'send-token'})

    case 'sendContract':
      return h(SendContractScreen, {key: 'send-contract'})

    case 'show-choose-contract-executor-page':
      return h(ChooseContractExecutorScreen, {key: 'show-choose-contract-executor-page'})

    case 'newKeychain':
      return h(NewKeyChainScreen, {key: 'new-keychain'})

    case 'confTx':
      return h(ConfirmTxScreen, {key: 'confirm-tx'})

    case 'add-token':
      return h(AddTokenScreen, {key: 'add-token'})

    case 'confirm-add-token':
      return h(ConfirmAddTokenScreen, {key: 'confirm-add-token'})

    case 'remove-token':
      return h(RemoveTokenScreen, {key: 'remove-token', ...props.currentView.context })

    case 'add-suggested-token':
      return h(AddSuggestedTokenScreen, {key: 'add-suggested-token'})

    case 'config':
      return h(ConfigScreen, {key: 'config'})

    case 'import-menu':
      return h(Import, {key: 'import-menu'})

    case 'forget-device':
      return h(ForgetDeviceScreen, {key: 'forget-device'})

    case 'hardware-wallets-menu':
      return h(ConnectHardwareForm, {key: 'hardware-wallets-menu'})

    case 'reveal-seed-conf':
      return h(RevealSeedConfirmation, {key: 'reveal-seed-conf'})

    case 'info':
      return h(InfoScreen, {key: 'info'})

    case 'buyEth':
      return h(BuyView, {key: 'buyEthView'})

    case 'onboardingBuyEth':
      return h(MascaraBuyEtherScreen, {key: 'buyEthView'})

    case 'qr':
      return h('div', {
        style: {
          height: '100%',
          top: '0px',
          left: '0px',
          width: '100%',
        },
      }, [
        h('.section-title.flex-row.flex-center', [
          h('i.fa.fa-arrow-left.fa-lg.cursor-pointer', {
            onClick: () => props.dispatch(actions.backToAccountDetail(props.selectedAddress)),
            style: {
              marginLeft: '30px',
              marginTop: '5px',
              position: 'absolute',
              left: '0',
            },
          }),
          h('h2.page-subtitle', {
            style: {
              fontFamily: 'Nunito SemiBold',
              marginTop: '10px',
              marginBottom: '0px',
              textAlign: 'center',
            },
          }, 'QR Code'),
        ]),
        h('div', [
          h(AccountQrScreen, {
            key: 'account-qr',
          }),
        ]),
      ])
    case 'delete-rpc':
      return h(DeleteRpc, {key: 'delete-rpc'})
    case 'delete-imported-account':
      return h(DeleteImportedAccount, {key: 'delete-imported-account'})
    case 'confirm-change-password':
      return h(ConfirmChangePassword, {key: 'confirm-change-password'})
    default:
      return h(AccountDetailScreen, {key: 'account-detail'})
  }
}

App.prototype.getNetworkName = function () {
  const { provider } = this.props
  const providerName = provider.type
  const network = getNetworkID({network: providerName})
  return getNetworkDisplayName(network.netId)
}
