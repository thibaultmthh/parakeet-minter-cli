import axios from "axios";
import { gas_price, gas_war_strategie } from "./ethTaskWraper";
import { blocknative_api_key } from "./settWarper";
import { web3 } from "./web3";
// import { web3 } from "./web3";

interface gasData {
	currentBlockNumber: number;
	msSinceLastBlock: number;
	blockPrices: {
		baseFeePerGas: number;
		estimatedPrices: {
			confidence: number;
			price: number;
			maxPriorityFeePerGas: number;
			maxFeePerGas: number;
		}[];
	}[];
}

export const nullGas: gasData = {
	currentBlockNumber: 0,
	msSinceLastBlock: 0,
	blockPrices: [
		{
			baseFeePerGas: 0,
			estimatedPrices: [
				{
					confidence: 0,
					price: 0,
					maxPriorityFeePerGas: 0,
					maxFeePerGas: 0,
				},
			],
		},
	],
};

let last = 0;
let lastdata: gasData;

export async function getCurrentGasPrices() {
	if (Date.now() - last < 6000 && lastdata) {
		return lastdata;
	}

	try {
		const data = (
			await axios.get("https://api.blocknative.com/gasprices/blockprices", {
				headers: { Authorization: blocknative_api_key },
			})
		).data as gasData;
		last = Date.now();
		lastdata = data;
		return data;
	} catch (e) {
		// console.log("Error getting gas data");
		return nullGas;
	}
}

export async function getCurrentSlowGasPrice() {
	try {
		return (
			Math.round(
				Number(web3.utils.fromWei(await web3.eth.getGasPrice(), "Gwei")) * 10
			) / 10
		);
	} catch (e: any) {
		console.log("Error getting gas price", e.message.split("\n")[0]);

		return 0;
	}
}

class GasManager {
	gas: { slow: number; fast: number };
	constructor() {
		this.gas = {
			slow: 0,
			fast: 0,
		};

		setInterval(async () => {
			this.gas.slow = await getCurrentSlowGasPrice();
			const fastGas = await getCurrentGasPrices();
			const fast = fastGas.blockPrices[0]?.estimatedPrices[0]?.price || 0;
			this.gas.fast = fast;
		}, 1000);
	}

	getGas() {
		return this.gas;
	}
}

export const gasManager = new GasManager();
Object.freeze(gasManager);

function taskGasPrice(gas: string) {
	const { slow, fast } = gasManager.getGas();
	if (gas === "slow") {
		return slow;
	}
	if (gas === "fast") {
		return fast;
	}
	if (gas[0] === "x") {
		if (gas[1] === "s") {
			return slow * Number(gas.slice(2));
		}
		if (gas[1] === "f") {
			return fast * Number(gas.slice(2));
		}
	}
	return Math.round(Number(gas) * 10) / 10;
}

export function getTaskGasPrice() {
	return Math.round(taskGasPrice(gas_price) * 100) / 100;
}

export function getTaskGasWarPrice() {
	const gas = taskGasPrice(gas_war_strategie.gas_price);
	if (gas > gas_war_strategie.max_gas_price) {
		return gas_war_strategie.max_gas_price;
	}
	return Math.round(gas * 10) / 10;
}
