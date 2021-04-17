const KardiaTool = require('kardia-tool')
const { RPC_ENDPOINT, KRC20ABI } = require('../../constant')

export const getKRC20ContractAtAddress = async (address) => {
  const kardiaTool = KardiaTool.default(global.metamask.rpcTarget)
  const kardiaProvider = kardiaTool.provider
  const kardiaContract = kardiaTool.contract
  const krc20ContractInstance = kardiaContract(kardiaProvider, '', KRC20ABI)

  const getSymbolInvoke = krc20ContractInstance.invoke({
    params: [],
    name: 'symbol',
  })
  const symbol = await getSymbolInvoke.call(address, {}, 'latest')

  const getDecimalsInvoke = krc20ContractInstance.invoke({
    params: [],
    name: 'decimals',
  })
  const decimals = await getDecimalsInvoke.call(address, {}, 'latest')

  return {
    symbol: () => symbol,
    decimals: () => decimals,
    balanceOf: async (walletAddress) => {
      const getBalanceInvok = krc20ContractInstance.invoke({
        params: [walletAddress],
        name: 'balanceOf',
      })
      return await await getBalanceInvok.call(address, {}, 'latest')
    },
  }
}
