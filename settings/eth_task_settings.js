// Modules
const axios = require('axios');

// Settings for the task


const task_wallets = ["main"];
// const task_wallets = [];
// contract options
const contract_address = "0xe935e764da0f1a2597f9c1bf13a64515bff9f7d7";
const function_name = "mint";
const value = 0.207;
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

		resolve([3]);
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
const gas_price = "xf1.1" // "slow", "fast", "xs20", "xf20", "200"

const gas_war_strategie = {
	resend: 7, // delay update gas price
	gas_price: "xf1.2", // "slow", "fast", "xs20", "xf20", "200"
	max_gas_price: 900,
}

const monitoring_strategie = {
	delay: 1,
	use: "variable",
	// use: "function",
	variable_monitoring: {
		variable: "minting",
		expected_value: true,
		stock_under: 4000,
	},
	custom_monitoring: () => { if (Math.random() > 0.5) return true; else return false; }
}

// Most likely will be default
const gas_limit = "300000";
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
