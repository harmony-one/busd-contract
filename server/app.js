const express = require('express')
const cors = require('cors')
const {
	getContractInstance,
	txContractMethod,
	callContractMethod,
	validateArgs
} = require('./contract-api')

/********************************
Private environmental variables
********************************/
const { endpoint, chain, port, mnemonic, privateKey } = require('../config')

/********************************
BUSD Import
********************************/
const BUSD = require('../build/contracts/BUSDImplementation.json')

/********************************
Set up Harmony instance
********************************/
const { Harmony } = require('@harmony-js/core')
const { ChainType } = require('@harmony-js/utils')
const hmy = new Harmony(endpoint,
	{
		chainType: ChainType.Harmony,
		chainId: chain,
	},
)

/********************************
Set up wallet
********************************/
const sender = hmy.wallet.addByMnemonic(mnemonic)
// const sender = hmy.wallet.addByPrivateKey(privateKey)

/********************************
Express
********************************/
const app = express()
app.use(cors())

/********************************
BUSD Method (call)
********************************/
//localhost:3000/call?method=name&args=arg1,arg2
app.get('/call', async (req, res) => {
	let {method, args} = req.query
	args = validateArgs(hmy, BUSD, method, args)
	//get instance
	const busd = getContractInstance(hmy, BUSD)
	let response = await callContractMethod(busd, method, ...args)
	if (response === null) {
		res.send({
			success: false,
			message: 'error: response is null',
		})
		return
	}
	console.log(response)
	res.send({
		success: true,
		response,
	})
})

/********************************
BUSD Transaction
********************************/
//localhost:3000/tx?method=transfer&args=address,uint256
app.get('/tx', async (req, res) => {
	let {method, args} = req.query
	args = validateArgs(hmy, BUSD, method, args)
	//get instance
	const busd = getContractInstance(hmy, BUSD)
	const { hash, receipt, error} = await txContractMethod(busd, method, ...args)
	console.log("hash: " + hash)
	console.log("receipt: " + receipt)
	res.send({
		success: !error,
		hash,
		receipt,
	})
})

app.listen(port, () => console.log(`App listening on port ${port}!`))