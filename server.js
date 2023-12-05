const express = require('express');
const fs = require('fs');
const app = express();
let instance = await EgMarket();

// let n_offers = instance.methods..;

app.use(express.static('public'));

app.use('/', async (req, res) => {
	res.status(200).json({message : "Data Endpoint working", status : "success", working : true});
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