import {
	eth_rpc,
	testnet,
	testnet_eth_rpc,
} from "./lib/settingsWrapers/settWarper";

export const isTestnet = testnet;
export const etherscan_api_link = isTestnet
	? "api-rinkeby.etherscan.io/"
	: "api.etherscan.io";

export const etherscanBase = testnet
	? "https://rinkeby.etherscan.io/"
	: "https://etherscan.io/";

export const ethRpc = testnet ? testnet_eth_rpc : eth_rpc;
