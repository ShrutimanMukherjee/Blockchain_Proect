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

    return contractAddress;
};

// ------- Main --------
(async () => {
    const contractAddress = await deploy_contract();
    console.log(`Outside function ${contractAddress}`);    
})();