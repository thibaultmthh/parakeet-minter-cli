import fs from "fs";

const settings = fs.readFileSync("settings/settings.json", "utf8");

export const {
	webhook_url,
	eth_rpc,
	testnet_eth_rpc,
	blocknative_api_key,
	etherscan_api_key,
	testnet,
} = JSON.parse(settings);
