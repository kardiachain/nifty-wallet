//load modules
const explorerLinks = require('../helpers/get-explorer-links')
const faucetLinks = require('../helpers/get-faucet-links')
const RPCEndpoints = require('../helpers/get-rpc-endpoints')
const netProps = require('../helpers/get-net-properties')

const chai = require('chai')
const assert = chai.assert

describe('eth-net-props', () => {
	let claimPrefix = 'should return correct explorer link for'
	describe('gets explorer links', () => {
		describe ('getExplorerAccountLinkFor()', () => {
			it(`${claimPrefix} Sokol Testnet`, () => {
				assert.equal(explorerLinks.getExplorerAccountLinkFor('0x95426f2bc716022fcf1def006dbc4bb81f5b5164', 77), 'https://blockscout.com/poa/sokol/address/0x95426f2bc716022fcf1def006dbc4bb81f5b5164')
			})
			it(`${claimPrefix} POA`, () => {
				assert.equal(explorerLinks.getExplorerAccountLinkFor('0x15c40c6de9f2299680a4522d8635c9b394eded09', 99), 'https://blockscout.com/poa/core/address/0x15c40c6de9f2299680a4522d8635c9b394eded09')
			})
			it(`${claimPrefix} xDai`, () => {
				assert.equal(explorerLinks.getExplorerAccountLinkFor('0x15c40c6de9f2299680a4522d8635c9b394eded09', 100), 'https://blockscout.com/poa/xdai/address/0x15c40c6de9f2299680a4522d8635c9b394eded09')
			})
			it(`${claimPrefix} Ethereum`, () => {
				assert.equal(explorerLinks.getExplorerAccountLinkFor('0x70FDd102DDB03Dc55B1719E76DfeA784916621fd', 1), 'https://etherscan.io/address/0x70FDd102DDB03Dc55B1719E76DfeA784916621fd')
			})
			it(`${claimPrefix} Ropsten Testnet`, () => {
				assert.equal(explorerLinks.getExplorerAccountLinkFor('0x70FDd102DDB03Dc55B1719E76DfeA784916621fd', 3), 'https://ropsten.etherscan.io/address/0x70FDd102DDB03Dc55B1719E76DfeA784916621fd')
			})
			it(`${claimPrefix} Rinkeby Testnet`, () => {
				assert.equal(explorerLinks.getExplorerAccountLinkFor('0x70FDd102DDB03Dc55B1719E76DfeA784916621fd', 4), 'https://rinkeby.etherscan.io/address/0x70FDd102DDB03Dc55B1719E76DfeA784916621fd')
			})
			it(`${claimPrefix} Kovan Testnet`, () => {
				assert.equal(explorerLinks.getExplorerAccountLinkFor('0x70FDd102DDB03Dc55B1719E76DfeA784916621fd', 42), 'https://kovan.etherscan.io/address/0x70FDd102DDB03Dc55B1719E76DfeA784916621fd')
			})
			it(`${claimPrefix} RSK`, () => {
				assert.equal(explorerLinks.getExplorerAccountLinkFor('0x70FDd102DDB03Dc55B1719E76DfeA784916621fd', 30), 'https://blockscout.com/rsk/mainnet/address/0x70FDd102DDB03Dc55B1719E76DfeA784916621fd')
			})
			it(`${claimPrefix} RSK Testnet`, () => {
				assert.equal(explorerLinks.getExplorerAccountLinkFor('0x70FDd102DDB03Dc55B1719E76DfeA784916621fd', 31), 'https://explorer.testnet.rsk.co/address/0x70FDd102DDB03Dc55B1719E76DfeA784916621fd')
			})
			it(`${claimPrefix} Goerli Testnet`, () => {
				assert.equal(explorerLinks.getExplorerAccountLinkFor('0xd8fe15886d2dcbc5d7c06394beb417aadaf1eee0', 5), 'https://goerli.etherscan.io/address/0xd8fe15886d2dcbc5d7c06394beb417aadaf1eee0')
			})
			it(`${claimPrefix} Ethereum Classic`, () => {
				assert.equal(explorerLinks.getExplorerAccountLinkFor('0xd8fe15886d2dcbc5d7c06394beb417aadaf1eee0', 61), 'https://blockscout.com/etc/mainnet/address/0xd8fe15886d2dcbc5d7c06394beb417aadaf1eee0')
			})
			it(`${claimPrefix} Ethereum Classic`, () => {
				assert.equal(explorerLinks.getExplorerAccountLinkFor('0xd8fe15886d2dcbc5d7c06394beb417aadaf1eee0', '61'), 'https://blockscout.com/etc/mainnet/address/0xd8fe15886d2dcbc5d7c06394beb417aadaf1eee0')
			})
		})

		describe ('getExplorerTxLinkFor()', () => {
			it(`${claimPrefix} Sokol Testnet`, () => {
				assert.equal(explorerLinks.getExplorerTxLinkFor('0x0af429e7a51e29ede74fe0748ffb6a141ffe41cfaaeadb4fca8b28c1914254c0', 77), 'https://blockscout.com/poa/sokol/tx/0x0af429e7a51e29ede74fe0748ffb6a141ffe41cfaaeadb4fca8b28c1914254c0')
			})
			it(`${claimPrefix} POA`, () => {
				assert.equal(explorerLinks.getExplorerTxLinkFor('0xb3b01bcc1a73477cd86de989cc207fa59f87ea601dea298772f4b1b3f6f1407e', 99), 'https://blockscout.com/poa/core/tx/0xb3b01bcc1a73477cd86de989cc207fa59f87ea601dea298772f4b1b3f6f1407e')
			})
			it(`${claimPrefix} xDai`, () => {
				assert.equal(explorerLinks.getExplorerTxLinkFor('0xb3b01bcc1a73477cd86de989cc207fa59f87ea601dea298772f4b1b3f6f1407e', 100), 'https://blockscout.com/poa/xdai/tx/0xb3b01bcc1a73477cd86de989cc207fa59f87ea601dea298772f4b1b3f6f1407e')
			})
			it(`${claimPrefix} Ethereum`, () => {
				assert.equal(explorerLinks.getExplorerTxLinkFor('0x892c825d1ec25b0a1a27aa5dff5b54fc4488a45029d0087fc40d3d733ded7305', 1), 'https://etherscan.io/tx/0x892c825d1ec25b0a1a27aa5dff5b54fc4488a45029d0087fc40d3d733ded7305')
			})
			it(`${claimPrefix} Ropsten Testnet`, () => {
				assert.equal(explorerLinks.getExplorerTxLinkFor('0x892c825d1ec25b0a1a27aa5dff5b54fc4488a45029d0087fc40d3d733ded7305', 3), 'https://ropsten.etherscan.io/tx/0x892c825d1ec25b0a1a27aa5dff5b54fc4488a45029d0087fc40d3d733ded7305')
			})
			it(`${claimPrefix} Rinkeby Testnet`, () => {
				assert.equal(explorerLinks.getExplorerTxLinkFor('0x892c825d1ec25b0a1a27aa5dff5b54fc4488a45029d0087fc40d3d733ded7305', 4), 'https://rinkeby.etherscan.io/tx/0x892c825d1ec25b0a1a27aa5dff5b54fc4488a45029d0087fc40d3d733ded7305')
			})
			it(`${claimPrefix} Kovan Testnet`, () => {
				assert.equal(explorerLinks.getExplorerTxLinkFor('0x892c825d1ec25b0a1a27aa5dff5b54fc4488a45029d0087fc40d3d733ded7305', 42), 'https://kovan.etherscan.io/tx/0x892c825d1ec25b0a1a27aa5dff5b54fc4488a45029d0087fc40d3d733ded7305')
			})
			it(`${claimPrefix} RSK`, () => {
				assert.equal(explorerLinks.getExplorerTxLinkFor('0x33a7511c7838f5be0ade40d732f0a51cd28c8a641de9079836170cbdac8e7d83', 30), 'https://blockscout.com/rsk/mainnet/tx/0x33a7511c7838f5be0ade40d732f0a51cd28c8a641de9079836170cbdac8e7d83')
			})
			it(`${claimPrefix} RSK Testnet`, () => {
				assert.equal(explorerLinks.getExplorerTxLinkFor('0x33a7511c7838f5be0ade40d732f0a51cd28c8a641de9079836170cbdac8e7d83', 31), 'https://explorer.testnet.rsk.co/tx/0x33a7511c7838f5be0ade40d732f0a51cd28c8a641de9079836170cbdac8e7d83')
			})
			it(`${claimPrefix} Goerli Testnet`, () => {
				assert.equal(explorerLinks.getExplorerTxLinkFor('0xb9599801c83e6aa20769e7dcdce0989c7380ba78cb587d3d7db11e1b30b17b54', 5), 'https://goerli.etherscan.io/tx/0xb9599801c83e6aa20769e7dcdce0989c7380ba78cb587d3d7db11e1b30b17b54')
			})
			it(`${claimPrefix} Ethereum Classic`, () => {
				assert.equal(explorerLinks.getExplorerTxLinkFor('0x430c90335b32fdcd92e54991668023d58b72bce836e204a81c6d97506c7137e5', 61), 'https://blockscout.com/etc/mainnet/tx/0x430c90335b32fdcd92e54991668023d58b72bce836e204a81c6d97506c7137e5')
			})
		})

		describe ('getExplorerTokenLinkFor()', () => {
			it(`${claimPrefix} Sokol Testnet`, () => {
				assert.equal(explorerLinks.getExplorerTokenLinkFor('0xcf2AEDCfb4ff2c9020fb61c41226A4DfD77D12dE', '0x70FDd102DDB03Dc55B1719E76DfeA784916621fd', 77), 'https://blockscout.com/poa/sokol/address/0x70FDd102DDB03Dc55B1719E76DfeA784916621fd/tokens/0xcf2AEDCfb4ff2c9020fb61c41226A4DfD77D12dE/token-transfers')
			})
			it(`${claimPrefix} POA`, () => {
				assert.equal(explorerLinks.getExplorerTokenLinkFor('0xAb2f2Dd3120dE530d38936EE09A74a6d17e3Da44', '0x4C4b0F3fb93A33d58b07117ae079775496CF9c17', 99), 'https://blockscout.com/poa/core/address/0x4C4b0F3fb93A33d58b07117ae079775496CF9c17/tokens/0xAb2f2Dd3120dE530d38936EE09A74a6d17e3Da44/token-transfers')
			})
			it(`${claimPrefix} xDai`, () => {
				assert.equal(explorerLinks.getExplorerTokenLinkFor('0xABE71e6a260C2eEa3C30864Dc50639100Aa315f6', '0xEca0f4Bd861713aF4f248CED18C15AF76440b00a', 100), 'https://blockscout.com/poa/xdai/address/0xEca0f4Bd861713aF4f248CED18C15AF76440b00a/tokens/0xABE71e6a260C2eEa3C30864Dc50639100Aa315f6/token-transfers')
			})
			it(`${claimPrefix} Ethereum`, () => {
				assert.equal(explorerLinks.getExplorerTokenLinkFor('0x5a386eb0fcbfee3f0d759e263053c09162ff102d', '0x2C343e73A594DfD1808b930372A610071bAa9d0E', 1), 'https://etherscan.io/token/0x5a386eb0fcbfee3f0d759e263053c09162ff102d?a=0x2C343e73A594DfD1808b930372A610071bAa9d0E')
			})
			it(`${claimPrefix} Ropsten Testnet`, () => {
				assert.equal(explorerLinks.getExplorerTokenLinkFor('0xcf2AEDCfb4ff2c9020fb61c41226A4DfD77D12dE', '0x70FDd102DDB03Dc55B1719E76DfeA784916621fd', 3), 'https://ropsten.etherscan.io/token/0xcf2AEDCfb4ff2c9020fb61c41226A4DfD77D12dE?a=0x70FDd102DDB03Dc55B1719E76DfeA784916621fd')
			})
			it(`${claimPrefix} Rinkeby Testnet`, () => {
				assert.equal(explorerLinks.getExplorerTokenLinkFor('0x4cc97adba4298d575ad22a42a976af4e2250b328', '0x70FDd102DDB03Dc55B1719E76DfeA784916621fd', 4), 'https://rinkeby.etherscan.io/token/0x4cc97adba4298d575ad22a42a976af4e2250b328?a=0x70FDd102DDB03Dc55B1719E76DfeA784916621fd')
			})
			it(`${claimPrefix} Kovan Testnet`, () => {
				assert.equal(explorerLinks.getExplorerTokenLinkFor('0x50c9fd8e20792e2decc5e35a0c1d17a51555347b', '0x70FDd102DDB03Dc55B1719E76DfeA784916621fd', 42), 'https://kovan.etherscan.io/token/0x50c9fd8e20792e2decc5e35a0c1d17a51555347b?a=0x70FDd102DDB03Dc55B1719E76DfeA784916621fd')
			})
			it(`${claimPrefix} RSK`, () => {
				assert.equal(explorerLinks.getExplorerTokenLinkFor('0x16cb2604ce5951c8506fbf690d816be6d0aa00fb', '0x604056c0f88aed17ef975269aab1ae9d02840bb2', 30), 'https://blockscout.com/rsk/mainnet/address/0x604056c0f88aed17ef975269aab1ae9d02840bb2/tokens/0x16cb2604ce5951c8506fbf690d816be6d0aa00fb/token-transfers')
			})
			it(`${claimPrefix} RSK Testnet`, () => {
				assert.equal(explorerLinks.getExplorerTokenLinkFor('0x16cb2604ce5951c8506fbf690d816be6d0aa00fb', '0x604056c0f88aed17ef975269aab1ae9d02840bb2', 31), 'https://explorer.testnet.rsk.co/address/0x16cb2604ce5951c8506fbf690d816be6d0aa00fb')
			})
			it(`${claimPrefix} Goerli Testnet`, () => {
				assert.equal(explorerLinks.getExplorerTokenLinkFor('0x7af963cf6d228e564e2a0aa0ddbf06210b38615d', '0x604056c0f88aed17ef975269aab1ae9d02840bb2', 5), 'https://goerli.etherscan.io/token/0x7af963cf6d228e564e2a0aa0ddbf06210b38615d?a=0x604056c0f88aed17ef975269aab1ae9d02840bb2')
			})
			it(`${claimPrefix} Ethereum Classic`, () => {
				assert.equal(explorerLinks.getExplorerTokenLinkFor('0x1ac1c8b874c7b889113a036ba443b082554be5d0', '0xdb23145b64D0E1e15dedf47abd77cCaf3F2327d7', 61), 'https://blockscout.com/etc/mainnet/address/0xdb23145b64D0E1e15dedf47abd77cCaf3F2327d7/tokens/0x1ac1c8b874c7b889113a036ba443b082554be5d0/token-transfers')
			})
		})
	})

	claimPrefix = 'should return correct faucet link for'
	describe('get faucet links', () => {
		it(`${claimPrefix} Sokol POA Testnet`, () => {
			const sokolFaucetLinks = faucetLinks.getFaucetLinks(77)
			assert.equal(sokolFaucetLinks.length, 1)
			if (sokolFaucetLinks.length > 0) {
				assert.equal(sokolFaucetLinks[0], 'https://faucet.poa.network/')
			}
		})
		it(`${claimPrefix} Ropsten Testnet`, () => {
			const ropstenFaucetLinks = faucetLinks.getFaucetLinks(3)
			assert.equal(ropstenFaucetLinks.length, 1)
			if (ropstenFaucetLinks.length > 0) {
				assert.equal(ropstenFaucetLinks[0], 'https://faucet.metamask.io/')
			}
		})
		it(`${claimPrefix} Rinkeby Testnet`, () => {
			const rinkebyFaucetLinks = faucetLinks.getFaucetLinks(4)
			assert.equal(rinkebyFaucetLinks.length, 1)
			if (rinkebyFaucetLinks.length > 0) {
				assert.equal(rinkebyFaucetLinks[0], 'https://faucet.rinkeby.io/')
			}
		})
		it(`${claimPrefix} Kovan Testnet`, () => {
			const kovanFaucetLinks = faucetLinks.getFaucetLinks(42)
			assert.equal(kovanFaucetLinks.length, 2)
			if (kovanFaucetLinks.length > 0) {
				assert.equal(kovanFaucetLinks[0], 'https://faucet.kovan.network/')
				assert.equal(kovanFaucetLinks[1], 'https://gitter.im/kovan-testnet/faucet/')
			}
		})
		it(`${claimPrefix} RSK Testnet`, () => {
			const RSKFaucetLinks = faucetLinks.getFaucetLinks(31)
			assert.equal(RSKFaucetLinks.length, 1)
			if (RSKFaucetLinks.length > 0) {
				assert.equal(RSKFaucetLinks[0], 'https://faucet.rsk.co/')
			}
		})
		it(`${claimPrefix} Goerli Testnet`, () => {
			const goerliFaucetLinks = faucetLinks.getFaucetLinks(5)
			assert.equal(goerliFaucetLinks.length, 1)
			if (goerliFaucetLinks.length > 0) {
				assert.equal(goerliFaucetLinks[0], 'https://goerli-faucet.slock.it/')
			}
		})
		it('should not return faucet link for production blockchains', () => {
			assert.equal(faucetLinks.getFaucetLinks(1).length, 0)
			assert.equal(faucetLinks.getFaucetLinks(99).length, 0)
			assert.equal(faucetLinks.getFaucetLinks(100).length, 0)
			assert.equal(faucetLinks.getFaucetLinks(30).length, 0)
		})
	})

	claimPrefix = 'should return correct RPC endpoint for'
	describe('get RPC endpoints', () => {
		it(`${claimPrefix} Sokol Testnet`, () => {
			const sokolRPCEndpoints = RPCEndpoints.getRPCEndpoints(77)
			assert.equal(sokolRPCEndpoints.length, 1)
			if (sokolRPCEndpoints.length > 0) {
				assert.equal(sokolRPCEndpoints[0], 'https://sokol.poa.network/')
			}
		})
		it(`${claimPrefix} Ropsten Testnet`, () => {
			const ropstenRPCEndpoints = RPCEndpoints.getRPCEndpoints(3)
			assert.equal(ropstenRPCEndpoints.length, 1)
			if (ropstenRPCEndpoints.length > 0) {
				assert.equal(ropstenRPCEndpoints[0], 'https://ropsten.infura.io/')
			}
		})
		it(`${claimPrefix} Rinkeby Testnet`, () => {
			const rinkebyRPCEndpoints = RPCEndpoints.getRPCEndpoints(4)
			assert.equal(rinkebyRPCEndpoints.length, 1)
			if (rinkebyRPCEndpoints.length > 0) {
				assert.equal(rinkebyRPCEndpoints[0], 'https://rinkeby.infura.io/')
			}
		})
		it(`${claimPrefix} Kovan Testnet`, () => {
			const kovanRPCEndpoints = RPCEndpoints.getRPCEndpoints(42)
			assert.equal(kovanRPCEndpoints.length, 1)
			if (kovanRPCEndpoints.length > 0) {
				assert.equal(kovanRPCEndpoints[0], 'https://kovan.poa.network/')
			}
		})
		it(`${claimPrefix} Ethereum`, () => {
			const MainnetRPCEndpoints = RPCEndpoints.getRPCEndpoints(1)
			assert.equal(MainnetRPCEndpoints.length, 1)
			if (MainnetRPCEndpoints.length > 0) {
				assert.equal(MainnetRPCEndpoints[0], 'https://mainnet.infura.io/')
			}
		})
		it(`${claimPrefix} POA`, () => {
			const POARPCEndpoints = RPCEndpoints.getRPCEndpoints(99)
			assert.equal(POARPCEndpoints.length, 1)
			if (POARPCEndpoints.length > 0) {
				assert.equal(POARPCEndpoints[0], 'https://core.poanetwork.dev/')
			}
		})
		it(`${claimPrefix} xDai`, () => {
			const xDaiRPCEndpoints = RPCEndpoints.getRPCEndpoints(100)
			assert.equal(xDaiRPCEndpoints.length, 1)
			if (xDaiRPCEndpoints.length > 0) {
				assert.equal(xDaiRPCEndpoints[0], 'https://xdai.poanetwork.dev/')
			}
		})
		it(`${claimPrefix} RSK`, () => {
			const RSKRPCEndpoints = RPCEndpoints.getRPCEndpoints(30)
			assert.equal(RSKRPCEndpoints.length, 1)
			if (RSKRPCEndpoints.length > 0) {
				assert.equal(RSKRPCEndpoints[0], 'https://public-node.rsk.co')
			}
		})
		it(`${claimPrefix} RSK Testnet`, () => {
			const RSKRPCEndpoints = RPCEndpoints.getRPCEndpoints(31)
			assert.equal(RSKRPCEndpoints.length, 1)
			if (RSKRPCEndpoints.length > 0) {
				assert.equal(RSKRPCEndpoints[0], 'https://public-node.testnet.rsk.co')
			}
		})
		it(`${claimPrefix} Goerli Testnet`, () => {
			const GoerliRPCEndpoints = RPCEndpoints.getRPCEndpoints(5)
			assert.equal(GoerliRPCEndpoints.length, 1)
			if (GoerliRPCEndpoints.length > 0) {
				assert.equal(GoerliRPCEndpoints[0], 'https://rpc.slock.it/goerli/')
			}
		})
		it(`${claimPrefix} Ethereum Classic`, () => {
			const ETCRPCEndpoints = RPCEndpoints.getRPCEndpoints(61)
			assert.equal(ETCRPCEndpoints.length, 1)
			if (ETCRPCEndpoints.length > 0) {
				assert.equal(ETCRPCEndpoints[0], 'https://www.ethercluster.com/etc')
			}
		})
	})

	claimPrefix = 'should return correct display name for'
	describe('get network properties', () => {
		it(`${claimPrefix} Sokol Testnet`, () => {
			assert.equal(netProps.getNetworkDisplayName(77), 'Sokol Testnet')
		})
		it(`${claimPrefix} POA`, () => {
			assert.equal(netProps.getNetworkDisplayName(99), 'POA')
		})
		it(`${claimPrefix} xDAI`, () => {
			assert.equal(netProps.getNetworkDisplayName(100), 'xDai')
		})
		it(`${claimPrefix} Ethereum`, () => {
			assert.equal(netProps.getNetworkDisplayName(1), 'Ethereum')
		})
		it(`${claimPrefix} RSK`, () => {
			assert.equal(netProps.getNetworkDisplayName(30), 'RSK')
		})
		it(`${claimPrefix} Ropsten Testnet`, () => {
			assert.equal(netProps.getNetworkDisplayName(3), 'Ropsten Testnet')
		})
		it(`${claimPrefix} Rinkeby Testnet`, () => {
			assert.equal(netProps.getNetworkDisplayName(4), 'Rinkeby Testnet')
		})
		it(`${claimPrefix} Kovan Testnet`, () => {
			assert.equal(netProps.getNetworkDisplayName(42), 'Kovan Testnet')
		})
		it(`${claimPrefix} RSK Testnet`, () => {
			assert.equal(netProps.getNetworkDisplayName(31), 'RSK Testnet')
		})
		it(`${claimPrefix} Goerli Testnet`, () => {
			assert.equal(netProps.getNetworkDisplayName(5), 'Görli Testnet')
		})
		it(`${claimPrefix} Ethereum Classic`, () => {
			assert.equal(netProps.getNetworkDisplayName(61), 'Ethereum Classic')
		})
		it(`${claimPrefix} Sokol Testnet`, () => {
			assert.equal(netProps.getNetworkDisplayName('77'), 'Sokol Testnet')
		})

		claimPrefix = 'should return correct coin name for'
		it(`${claimPrefix} Sokol Testnet`, () => {
			assert.equal(netProps.getNetworkCoinName(77), 'POA')
		})
		it(`${claimPrefix} POA`, () => {
			assert.equal(netProps.getNetworkCoinName(99), 'POA')
		})
		it(`${claimPrefix} xDAI`, () => {
			assert.equal(netProps.getNetworkCoinName(100), 'xDAI')
		})
		it(`${claimPrefix} Ethereum`, () => {
			assert.equal(netProps.getNetworkCoinName(1), 'ETH')
		})
		it(`${claimPrefix} RSK`, () => {
			assert.equal(netProps.getNetworkCoinName(30), 'RBTC')
		})
		it(`${claimPrefix} Ropsten Testnet`, () => {
			assert.equal(netProps.getNetworkCoinName(3), 'ETH')
		})
		it(`${claimPrefix} Rinkeby Testnet`, () => {
			assert.equal(netProps.getNetworkCoinName(4), 'ETH')
		})
		it(`${claimPrefix} Kovan Testnet`, () => {
			assert.equal(netProps.getNetworkCoinName(42), 'ETH')
		})
		it(`${claimPrefix} RSK Testnet`, () => {
			assert.equal(netProps.getNetworkCoinName(31), 'RBTC')
		})
		it(`${claimPrefix} Goerli Testnet`, () => {
			assert.equal(netProps.getNetworkCoinName(5), 'GöETH')
		})
		it(`${claimPrefix} Ethereum Classic`, () => {
			assert.equal(netProps.getNetworkCoinName(61), 'ETC')
		})

		it('Sokol is a testnet', () => {
			assert.equal(netProps.isTestnet(77), true)
		})
		it('POA is a mainnet', () => {
			assert.equal(netProps.isTestnet(99), false)
		})
		it('xDAI is a mainnet', () => {
			assert.equal(netProps.isTestnet(100), false)
		})
		it('Ethereum is a mainnet', () => {
			assert.equal(netProps.isTestnet(1), false)
		})
		it('RSK is a mainnet', () => {
			assert.equal(netProps.isTestnet(30), false)
		})
		it('Ropsten is a testnet', () => {
			assert.equal(netProps.isTestnet(3), true)
		})
		it('Rinkeby is a testnet', () => {
			assert.equal(netProps.isTestnet(4), true)
		})
		it('Kovan is a testnet', () => {
			assert.equal(netProps.isTestnet(42), true)
		})
		it('RSK Testnet is a testnet', () => {
			assert.equal(netProps.isTestnet(31), true)
		})
		it('Goerli is a testnet', () => {
			assert.equal(netProps.isTestnet(5), true)
		})
		it('Ethereum Classic is a mainnet', () => {
			assert.equal(netProps.isTestnet(61), false)
		})
	})
})