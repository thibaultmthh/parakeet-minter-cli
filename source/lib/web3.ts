import Web3 from "web3";
import { ethRpc } from "../constantes";

export const web3 = new Web3(new Web3.providers.HttpProvider(ethRpc));

export const WEI = 1e18;

export async function getLastBlockInfo() {
	const block = await web3.eth.getBlock("latest");

	return {
		number: Number(block.number),
		timestamp: Number(block.timestamp),
	};
}
