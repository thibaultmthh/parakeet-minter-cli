import Web3 from "web3";

const { eth_rpc } = require("../../settings/settings.json");

export const web3 = new Web3(new Web3.providers.HttpProvider(eth_rpc));

export const WEI = 1e18;

export async function getLastBlockInfo() {
	const block = await web3.eth.getBlock("latest");

	return {
		number: Number(block.number),
		timestamp: Number(block.timestamp),
	};
}
