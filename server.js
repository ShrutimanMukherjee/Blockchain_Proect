// NOTE: Deploy global ganche-cli with command `ganache-cli -l 9999999 -g 1000`

const express = require('express');
const fs = require('fs');
const app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

const Web3 = require('web3');
const web3_obj = new Web3( new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
const compiledContract = require('./build/contracts/EgMarket.json'); // compiled in advance using truffle

class HouseNode {
	--
}

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
	let current = null;
	// -------- Web3 Contract Instance ----------------------------------
	const instance =  new web3_obj.eth.Contract(compiledContract.abi, contractAddress);
	
	// -------------- Initial Simulated transactions ------------------------------
	await instance.methods.setMainProvider(accounts[0]).send({from : accounts[0],  gas: '9999999'});
    let mainProvider = await instance.methods.getMainProvider().call();
    console.log(`Main provider set to --> ${mainProvider}`);

    await instance.methods.placeRequest(200,0).send({from : accounts[3],  gas: '9999999'});
    await instance.methods.placeRequest(100,1).send({from : accounts[3],  gas: '9999999'});

	await instance.methods.placeOffer(50, 0).send({from : accounts[1], gas: '9999999'});
	await instance.methods.placeOffer(70,0).send({from : accounts[2],  gas: '9999999'});
    await instance.methods.placeOffer(20, 0).send({from : accounts[4],  gas: '9999999'}); // best 0

    await instance.methods.placeOffer(50, 1).send({from : accounts[1], gas: '9999999'});
	await instance.methods.placeOffer(70, 1).send({from : accounts[2],  gas: '9999999'});
    await instance.methods.placeOffer(20, 1).send({from : accounts[4],  gas: '9999999'}); // best 1

	let offers = await instance.methods.getOffers().call();
	let requests = await instance.methods.getRequests().call();

    console.log(`Requests = ${JSON.stringify(requests)}`);
    console.log(`Offers = ${JSON.stringify(offers)}`);

    console.log("Best Offers for requests:");
    for( i=0; i<requests.length; i++ ) {
        console.log(` ${i} ---- ${ JSON.stringify(await instance.methods.getBestOffer(i).call())}`);
    }

	console.log(`n_offers = ${offers.length}`)
	console.log(`n_requests = ${requests.length}`)
	
	// ------------------ Express App Setup -----------------------------
	// app.use(express.static('public'));
	// app.use('/public', express.static('public'));
	app.set('views', __dirname+'/views');
	app.set('view engine', 'pug');
	
	app.get('/', async (req, res) => {
		res.status(200);
		// res.send(`No. of offfers = ${offers.length} <br> No. of offfers = ${requests.length}`);
		// res.render('index', {n_offers : offers.length , n_requests : requests.length});
		res.sendFile(__dirname+'/views/login.html');
	});

	app.post('/', urlencodedParser, async (req,res) => {
		// console.log(req.body);
		let acc = req.body.account;
		if(accounts.includes(acc)) {
			current = acc;
			res.redirect('/dashboard');
		}
		else {
			res.redirect('/');
		}
	});

	app.get('/dashboard', async (req,res) => {
		if(current==null){
			res.redirect('/');
		}
		best_offers_lst = [];
		for( i=0; i<requests.length; i++ ) {
			let curr_best_offer = await instance.methods.getBestOffer(i).call();
			if(curr_best_offer.isSet) {
				best_offer_lst.push(curr_best_offer);
			}
			else {
				best_offer_lst.push(null);
			}
		}

		res.render('dashboard', {offers : offers,
								requests : requests, 
								current : current, 
								accounts : accounts, 
								best_offers_lst : best_offers_lst});
	});

	app.post('/place_offer', urlencodedParser, async (req,res) => {
		console.log(req.body);
		let ind = req.body.req_ind;
		let eg_req = requests[parseInt(ind)];
		let offer_price = req.body.price;
		// handle balance check before placing
		--
		await instance.methods.placeOffer(offer_price, ind).send({from : current, gas: '9999999'});
		res.redirect('/dashboard');
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