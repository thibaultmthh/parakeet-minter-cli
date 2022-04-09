import { loadContract } from "./contracts";
import { eth_task_settings } from "./settingWrapers/ethTaskWraper";

let current_supply: string;

const [contract_address, stock_variable] = [
	eth_task_settings.contract.contract_address,
	eth_task_settings.contract.advenced.stock_variable,
];
const monitoring_s = eth_task_settings.monitoring;

async function monitorSupply(callback: (supply: string) => void) {
	try {
		const contract = await loadContract(
			eth_task_settings.contract.contract_address
		);
		const newSupply = (await contract.methods[stock_variable]().call()) || "0";
		if (current_supply !== newSupply) {
			current_supply = newSupply;
			callback(current_supply || "x");
		}
	} catch (e) {}
}

export async function startMonitorSupply(callback: (stock: string) => void) {
	monitorSupply(callback);

	setInterval(async () => {
		monitorSupply(callback);
	}, 1000);
}

export async function monitoring(callback: (message: string) => void) {
	return new Promise<void>((resolve) => {
		let i: NodeJS.Timer;
		const funct = async () => {
			let good = true;
			let message = "";
			console.log("monitoring");

			for (let i = 0; i < monitoring_s.use.length; i++) {
				const strategie_type = monitoring_s.use[i];
				if (strategie_type === "variable") {
					try {
						const contract = await loadContract(contract_address);
						const variable_value = await contract!.methods[
							monitoring_s.variable.variable
						]().call();
						if (variable_value != monitoring_s.variable.expected_value) {
							good = false;
							message += `${variable_value} != ${monitoring_s.variable.expected_value}`;
						} else {
							message += "V OK ";
						}
					} catch (e) {
						console.log(e);
						message += "Error variable";
						// callback("Error monitoring ");
					}
				}
				if (strategie_type == "timestamp") {
					monitoring_s.timestamp.over;
					if (monitoring_s.timestamp.over < (Date.now() + 200) / 1000) {
						message += "TT OK";
					} else {
						good = false;
						message += "TT NO";
					}
				}
				if (strategie_type == "stock") {
					if (
						Number(current_supply) <= monitoring_s.stock.over ||
						Number(current_supply) >= monitoring_s.stock.under
					) {
						good = false;
						message += "S NO";
					} else {
						message += "S OK";
					}
				}
			}
			callback(message);
			if (good) {
				clearInterval(i);
				resolve();
			}
		};
		funct();
		i = setInterval(funct, monitoring_s.delay * 1000);
	});
}
