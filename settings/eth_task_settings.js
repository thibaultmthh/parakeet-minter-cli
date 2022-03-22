// Modules
const axios = require('axios');

// Settings for the task


const task_wallets = ["23"];
// const task_wallets = [];
// contract options
const contract_address = "0xa86359c1ad8c0483a1a49b37ea3646deaf6e342a";
const function_name = "mint";
const value = 0.2;
// parameters option
const parameters = async (adresse) => {
	// const options = {
	// 	method: 'POST',
	// 	url: 'https://bobu.azuki.com/api/generate_signature',
	// 	headers: { 'Content-Type': 'application/json' },
	// 	data: { address: adresse }
	// };
	// return new Promise(async (resolve, reject) => {
	// 	axios.request(options).then(function (response) {
	// 		try {
	// 			resolve([1, response.data.signature]);
	// 		}
	// 		catch (e) {
	// 			reject(e);
	// 		}
	// 	}).catch(function (error) {
	// 		console.error(error);
	// 		reject(error);
	// 	});
	// });
	// const data = ["val1", "val2"];

	return new Promise(async (resolve, reject) => {

		resolve([adresse, 5]);
	});

};

const parameters_validation = async (parameters) => {
	let good = true;
	for (let i = 0; i < parameters.length; i++) {
		const para = parameters[i];
		if (para === undefined) {
			good = false;
			break;
		}
	}
	if (!good) {
		console.log("parameters are not valid", parameters);
	}
	return good;
}

const fetch_parameters_retry_delay = 4000;



// contract advanced options
const stock_variable = "totalSupply"


// Gas strategie
const gas_price = "2800" // "slow", "fast", "xs20", "xf20", "200"

const gas_war_strategie = {
	resend: 10, // delay update gas price
	gas_price: "xf1.2", // "slow", "fast", "xs20", "xf20", "200"
	max_gas_price: 4100,
}

const monitoring_strategie = {
	delay: 1,
	use: "variable",
	// use: "function",
	variable_monitoring: {
		variable: "mainSaleOn",
		expected_value: true,
		stock_under: 4000,
	},
	custom_monitoring: () => { if (Math.random() > 0.5) return true; else return false; }
}

// Most likely will be default
const gas_limit = "85000";
const is_proxy_contract = false
const custom_abi = []

// utils







// random in array
const random_in_array = (array) => {
	return array[Math.floor(Math.random() * array.length)];
}

module.exports = {
	task_wallets,
	contract_address,
	function_name,
	value,
	gas_limit,
	parameters,
	parameters_validation,
	gas_price,
	stock_variable,
	gas_war_strategie,
	monitoring_strategie,
	fetch_parameters_retry_delay
};
