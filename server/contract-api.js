const config = require('../config')
const { chain } = config
const gasLimit = '1000000'
const gasPrice = '1000000000'

oneToHexAddress = (hmy, address) => hmy.crypto.getAddress(address).basicHex

exports.validateArgs = (hmy, artifact, method, args) => {
    const argTypes = Object.keys(artifact.devdoc.methods).find((m) => m.indexOf(method) === 0)
		.split('(')[1].split(')')[0].split(',')

	args = args.split(',').map((arg, i) => {
		if (argTypes[i] === 'address') {
			if (arg.substring(0, 3) === 'one') {
				arg = oneToHexAddress(hmy, arg)
			}
        }
		// if (argTypes[i] === 'uint256') {
        // 	arg = new hmy.utils.Unit(arg).asEther().toWei()
        // }
        return arg
    })
    return args
}

exports.getContractInstance = (hmy, artifact) => {
    console.log(chain)
    console.log(artifact.networks[chain].address)
    const contract = hmy.contracts.createContract(
        artifact.abi, artifact.networks[chain].address
    )
    return contract
}

exports.callContractMethod = (contract, method, ...args) => {
    contract.methods[method](...args).call({ gasLimit, gasPrice })
}

exports.txContractMethod = (contract, method, ...args) => new Promise((resolve, reject) => {
    let hash, receipt, error //assigned in listener
    const done = () => resolve({
        hash, receipt, error
    })
    console.log('getContractMethod args', ...args)
    const tx = contract.methods[method](...args)
    .send({
        gasLimit,
        gasPrice
    })
    .on('transactionHash', (_hash) => {
        hash = _hash
        console.log('hash', hash)
    }).on('receipt', (_receipt) => {
        receipt = _receipt
        console.log('receipt', receipt)
    }).on('confirmation', (confirmationNumber, receipt) => {
        done()
    }).on('error', (_error) => {
        error = _error
        done()
    })
    console.log(tx)
})
