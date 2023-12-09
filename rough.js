// `ganache-cli -l 9999999 -g 1000`
const Web3 = require('web3');
const web3_obj = new Web3( new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
const compiledContract = require('./build/contracts/EgMarket.json'); // compiled in advance using truffle

const deploy_contract = async () => {
    let accounts =  await web3_obj.eth.getAccounts();
    console.log(` Accounts = ${accounts}`);

    console.log('Deploying from account', accounts[0]);
    const res = await new web3_obj.eth.Contract(compiledContract.abi
                ).deploy({ data: compiledContract.bytecode }
                ).send({from: accounts[0], gas: 1999999});
    const contractAddress = res.options.address
    console.log('Deployed to', contractAddress);

    return {contractAddress, accounts};
};

// ------- Main --------
(async () => {
    let {contractAddress, accounts} = await deploy_contract();
    console.log(`Outside function ${contractAddress} \n ----------------\n`); 
    
    const instance =  new web3_obj.eth.Contract(compiledContract.abi, contractAddress);
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
})();