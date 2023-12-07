// NOTE: Deploy global ganche-cli with command `ganache-cli -l 9999999 -g 1000`

const express = require('express');
const fs = require('fs');
const app = express();

const Web3 = require('web3');
const web3_obj = new Web3( new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
const compiledContract = require('./build/contracts/EgMarket.json'); // compiled in advance using truffle

// -------- Deploy contract [! Ensure working Ganache] --------------
const deploy_contract = async () => {
    let accounts =  await web3_obj.eth.getAccounts();
    console.log(` Accounts = ${accounts}`);

    console.log('Deploying from account', accounts[0]);
    const res = await new web3_obj.eth.Contract(compiledContract.abi
                ).deploy({ data: compiledContract.bytecode }
                ).send({from: accounts[0], gas: '9999999'});
    const contractAddress = res.options.address
    console.log('Deployed to', contractAddress);

	return {contractAddress, accounts};
};

// -------- MAIN --------------
(async () => {
	let {contractAddress, accounts} = await deploy_contract();
	// -------- Web3 Contract Instance ----------------------------------
	const instance =  new web3_obj.eth.Contract(compiledContract.abi, contractAddress);
	
	// -------------- Testing transactions ------------------------------
	let mainProvider = accounts[0];
	await instance.methods.setMainProvider(mainProvider).call();
	await instance.methods.placeOffer(100, 50).send({from : accounts[1], gas: '9999999'});
	await instance.methods.placeOffer(200, 70).send({from : accounts[2],  gas: '9999999'});
	await instance.methods.placeRequest(50).send({from : accounts[3],  gas: '9999999'});
	let offers = await instance.methods.getOffers().call() //.then( (arr) => arr.length );
	let requests = await instance.methods.getRequests().call() //.then( (arr) => arr.length );

	console.log(`n_offers = ${offers.length}`)
	console.log(`n_requests = ${requests.length}`)
	
	// ------------------ Express App Setup -----------------------------
	app.use(express.static('public'));
	// app.use('/public', express.static('public'));
	app.set('views', __dirname+'/views');
	app.set('view engine', 'pug');
	
	app.use('/', async (req, res) => {
		res.status(200);
		// res.send(`No. of offfers = ${offers.length} <br> No. of offfers = ${requests.length}`);
		// res.sendFile(__dirname+'/public/index.html');
		res.render('index', {n_offers : offers.length , n_requests : requests.length});
	});
	
	const PORT = 3000;
	app.listen(PORT, (err) => {
		if(err) {
			console.log("Could not start server");
			console.log('Error: ', err);
			return;
		}
		console.log(`Server started at http://localhost:${PORT}`);
	})

})();