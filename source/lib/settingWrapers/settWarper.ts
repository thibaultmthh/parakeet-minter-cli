import fs from "fs";

const settings = fs.readFileSync(
	process.cwd() + "/settings/settings.json",
	"utf8"
);

export const {
	webhook_url,
	eth_rpc,
	testnet_eth_rpc,
	blocknative_api_key,
	etherscan_api_key,
	testnet,
	licence,
} = JSON.parse(settings);
