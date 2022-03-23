import fs from "fs";

const eth_task_file = fs.readFileSync("settings/eth_task_settings.js", "utf8");

const data = eval("(" + eth_task_file + ")")();
console.log(data, "is data");

export const {
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
	fetch_parameters_retry_delay,
} = data;
