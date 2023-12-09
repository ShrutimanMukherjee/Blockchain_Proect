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
	constructor( address, energy, money, offered_eg, n_requests ) {
		this.address = address;
		this.energy = energy;
		this.money = money;
		this.offered_eg = offered_eg;
		this.n_requests = n_requests;
	}
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

	let houseNodes = {};
	for(addr in accounts) {
		houseNodes[addr] = new HouseNode(addr, 2000, 100,0, 0);
	}
	houseNodes[accounts[0]].energy = 200000;

	let current = null; //logged in address
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
	app.set('views', __dirname+'/views');
	app.set('view engine', 'pug');
	
	app.get('/', async (req, res) => {
		res.status(200);
		res.sendFile(__dirname+'/views/login.html');
	});

	app.post('/', urlencodedParser, async (req,res) => {
		let acc = req.body.account;
		if(accounts.includes(acc)) {
			current = acc;
			res.redirect('/dashboard');
		}
		else {
			res.redirect('/');
		}
	});

	app.use('/logout', async (req, res) => {
		current = null;
		res.redirect('/');
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
		offers = await instance.methods.getOffers().call();
		requests = await instance.methods.getRequests().call();
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
		// handle eg balance check before placing
		if(eg_req.qty  > houseNodes[current].energy - houseNodes[current].offered_eg) {
			res.send(`<h1> Insufficient Energy Balance </h1> <h3> Redirecting in 2s <h3>`);
			setTimeout(res.redirect, 2000, '/dashboard');
			return;
		}
		let offer_res = await instance.methods.placeOffer(offer_price, ind).send({from : current, gas: '9999999'});
		offers = await instance.methods.getOffers().call();
		if(offer_res) {
			houseNodes[current].offered_eg += eg_req.qty;
		}
		res.redirect('/dashboard');
	});

	app.post('/place_request', urlencodedParser, async (req,res) => {
		let eg_qty = req.body.qty;
		await instance.methods.placeRequest(eg_qty,houseNodes[current].n_requests).send({from : current,  gas: '9999999'});
		requests = await instance.methods.getRequests().call();
		houseNodes[current].n_requests += 1;
		res.redirect('/dashboard');
	});

	app.post('/accept_offer', urlencodedParser, async (req,res) => {
		offers = await instance.methods.getOffers().call();
		requests = await instance.methods.getRequests().call();

		let ind = req.body.req_ind;
		let eg_req = requests[ind];
		let best_off = await instance.methods.getBestOffer(ind).call();

		try {
			web3_obj.eth.sendTransaction({	from : current,
											to : eg_req.owner,
											value : best_off.price
										});
		}
		catch(err) {
			console.log(err);
			res.send(`<p> ${err} </p> <h3> Redirecting in 2s <h3>`);
			setTimeout(res.redirect, 2000, '/dashboard');
			return;
		}
		// res.send(`<h1>Pending Page</h1>`);
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