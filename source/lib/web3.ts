import Web3 from "web3";
import { ethRpc } from "../constantes";

export const web3 = new Web3(new Web3.providers.HttpProvider(ethRpc));

export const WEI = 1e18;

export async function getLastBlockInfo() {
	try {
		const block = await web3.eth.getBlock("latest");

		return {
			number: Number(block.number),
			timestamp: Number(block.timestamp),
		};
	} catch (e: any) {
		console.log("Error getting last block info", e.message.split("\n")[0]);
		return {
			number: 0,
			timestamp: Date.now(),
		};
	}
}
