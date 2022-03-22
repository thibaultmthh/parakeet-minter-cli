const {
	testnet,
	eth_rpc,
	testnet_eth_rpc,
} = require("../settings/settings.json");

export const isTestnet = testnet;
export const etherscan_api_link = isTestnet
	? "api-rinkeby.etherscan.io/"
	: "api.etherscan.io";

export const etherscanBase = testnet
	? "https://rinkeby.etherscan.io/"
	: "https://etherscan.io/";

export const ethRpc = testnet ? testnet_eth_rpc : eth_rpc;
