import path from "path";

export const {
	webhook_url,
	eth_rpc,
	testnet_eth_rpc,
	blocknative_api_key,
	etherscan_api_key,
	testnet,
} = require(path.resolve(process.cwd(), "settings/settings.json"));
