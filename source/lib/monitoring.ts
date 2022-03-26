import { loadContract } from "./contracts";
import {
	contract_address,
	monitoring_strategie,
	stock_variable,
} from "./settingWrapers/ethTaskWraper";

let current_supply: string;

async function monitorSupply(callback: (supply: string) => void) {
	try {
		const contract = await loadContract(contract_address);
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

			for (let i = 0; i < monitoring_strategie.use.length; i++) {
				const strategie_type = monitoring_strategie.use[i];
				if (strategie_type === "variable") {
					try {
						const contract = await loadContract(contract_address);
						const variable_value = await contract!.methods[
							monitoring_strategie.variable_monitoring.variable
						]().call();
						if (
							variable_value !=
							monitoring_strategie.variable_monitoring.expected_value
						) {
							good = false;
							message += `${variable_value} != ${monitoring_strategie.variable_monitoring.expected_value}`;
						} else {
							message += "V OK ";
						}
					} catch (e) {
						console.log(e);
						message += "Error variable";
						// callback("Error monitoring ");
					}
				}
				if (strategie_type == "function") {
					const r = await monitoring_strategie.custom_monitoring();
					if (!r) {
						good = false;
						message += "F NO";
					} else {
						message += "F OK";
					}
				}
				if (strategie_type == "stock") {
					if (
						Number(current_supply) <=
							monitoring_strategie.stock_monitoring.over ||
						Number(current_supply) >=
							monitoring_strategie.stock_monitoring.under
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
		i = setInterval(funct, monitoring_strategie.delay * 1000);
	});
}
