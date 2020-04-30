const express = require('express')
// import or require Harmony class
const { Harmony } = require('@harmony-js/core')
// import or require settings
const { ChainType } = require('@harmony-js/utils')
// import or require simutlated keystore (optional)
const { importKey } = require('./simulated-keystore')
const {
	getContractInstance,
	txContractMethod,
	callContractMethod,
	validateArgs,
	oneToHexAddress
} = require('./contract-api')
/********************************
Config
********************************/
const config = require('../config')
const { ENV, url, net, port, privateKey } = config
/********************************
Contract Imports
********************************/
const BUSD = require('../build/contracts/BUSDImplementation.json')
/********************************
Harmony
********************************/
const hmy = new Harmony(url,
	{
		chainType: ChainType.Harmony,
		chainId: net,
	},
)
/********************************
Set up any wallets - see simulated-keystore.js
********************************/
// add privateKey to wallet
// localnet: one103q7qe5t2505lypvltkqtddaef5tzfxwsse4z7
// testnet: one18t4yj4fuutj83uwqckkvxp9gfa0568uc48ggj7
// const alice = hmy.wallet.addByPrivateKey(privateKey)
// //one1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65
// const bob = hmy.wallet.addByMnemonic('surge welcome lion goose gate consider taste injury health march debris kick')
// console.log('alice', alice.bech32Address)
// console.log('bob', bob.bech32Address)
/********************************
Express
********************************/
const app = express()
/********************************
Generic Method (call)
********************************/
//example (local): localhost:3000/call?method=name&args=arg1,arg2
app.get('/call', async (req, res) => {
	let {method, args} = req.query
	args = validateArgs(BUSD, method, args)
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
	res.send({
		success: true,
		response,
	})
})
/********************************
Generic Transaction
********************************/
//localhost:3000/tx?method=transfer&args=address,uint256
app.get('/tx', async (req, res) => {
	let {method, args} = req.query
	args = validateArgs(BUSD, method, args)
	//get instance
	const busd = getContractInstance(hmy, BUSD)
	const { hash, receipt, error} = await txContractMethod(busd, method, ...args)
	res.send({
		success: !error,
		hash,
		receipt,
	})
})

/********************************
ONE transfer and balance methods (also see examples/node-sdk for simple example of this)
********************************/

let transfers = {
	address: true
}
//example:
// localhost:3000/transfer?to=one1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65&value=1
// localhost:3000/transfer?from=one1w7lu05adqfhv8slx0aq8lgzglk5vrnwvf5f740&to=one1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65&value=1
// localhost:3000/transfer?to=one1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65&value=1&fromshard=0&toshard=1
app.get('/transfer', async (req, res) => {
    const {to, from, toshard, fromshard, value} = req.query
	if (!to || !value) {
		res.send({success: false, message: 'missing to or value query params e.g. localhost:3000/transfer?to=one1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65&value=1'})
		return
	}
	//defaults to shard 0
	const toShard = !toshard ? 0x0 : '0x' + toshard
	const fromShard = !fromshard ? 0x0 : '0x' + fromshard
	console.log(to, value)
	//checks for from argument and attempts to set address as signer
	//will fail if key isn't in keystore
	if (from) {
		const pkey = importKey(from)
		if(pkey) {
			hmy.wallet.addByPrivateKey(pkey)
			hmy.wallet.setSigner(hmy.crypto.getAddress(from).basicHex)
		}
		else {
			res.send({success: false, message: `account ${from} not in keystore`})
			return
		}
	} else {
		//set signer to default if from isn't used
		hmy.wallet.setSigner(alice.address)
	}
	//prevent accidental re-entry if transaction is in flight
	if (transfers[to]) return
	transfers[to] = true
	//prepare transaction
	const tx = hmy.transactions.newTx({
        to,
        value: new hmy.utils.Unit(value).asEther().toWei(),
        gasLimit: '21000',
        shardID: fromShard,
        toShardID: toShard,
        gasPrice: new hmy.utils.Unit('1').asGwei().toWei(),
    });
    const signedTX = await hmy.wallet.signTransaction(tx);
    signedTX.observed().on('transactionHash', (txHash) => {
        console.log('--- txHash ---', txHash)
    }).on('receipt', (receipt) => {
		// console.log('--- receipt ---', receipt)
		transfers[to] = false //can send again
		res.send({ success: true, receipt })
    }).on('error', console.error)
    const [sentTX, txHash] = await signedTX.sendTransaction()
    const confirmedTX = await sentTX.confirm(txHash)
})

/********************************
Get balance
********************************/
// localhost:3000/balance?address=one1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65
app.get('/balance', async (req, res) => {
	const {address, shard} = req.query
	if (!address) {
		res.send({success: false, message: 'missing address query param e.g. localhost:3000/transfer?to=one1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65&value=1'})
	}
	const shardID = !shard ? 0 : parseInt(shard)
	//rpc call
	const result = (await hmy.blockchain.getBalance({ address, shardID }).catch((error) => {
		res.send({success: false, error })
	})).result
	if (result) {
		res.send({success: true, balance: new hmy.utils.Unit(result).asWei().toEther()})
	}
})

/********************************
Get Examples
********************************/
app.set('json spaces', 4)
app.get('/', (req, res) => {
	res.send({
		success: true,
		message: 'Harmony JS SDK NodeJS API Demo',
		methods: Object.keys(BUSD.devdoc.methods).map((k, i) => 
			`localhost:3000/call?method=${k.split('(')[0]}&args=${k.split('(')[1].split(')')[0]}`
		),
		transactions: Object.keys(BUSD.devdoc.methods).map((k, i) => 
			`localhost:3000/tx?method=${k.split('(')[0]}&args=${k.split('(')[1].split(')')[0]}`
		)
	})
})

app.listen(port, () => console.log(`App listening on port ${port}!`))