import { isTestnet } from "../constantes";
import { web3 } from "./web3";
import fs from "fs";
console.log(__dirname, "webhooks.ts");

const abi = JSON.parse(fs.readFileSync("data/abi/opensea.json", "utf8"));

const contract = new web3.eth.Contract(
	abi,
	"0xa5409ec958c83c3f309868babaca7c86dcb077c1"
);

export async function isOpenseaRegistered(adresse: string) {
	if (isTestnet) {
		return true;
	}
	const isRegistered =
		(await contract.methods.proxies(adresse).call()) !==
		"0x0000000000000000000000000000000000000000";

	return isRegistered;
}
