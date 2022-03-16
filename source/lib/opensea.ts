import { testnet } from "../constantes";
import { web3 } from "./web3";

const abi = require("../../data/abi/opensea.json");
const contract = new web3.eth.Contract(
	abi,
	"0xa5409ec958c83c3f309868babaca7c86dcb077c1"
);

export async function isOpenseaRegistered(adresse: string) {
	if (testnet) {
		return true;
	}
	const isRegistered =
		(await contract.methods.proxies(adresse).call()) !==
		"0x0000000000000000000000000000000000000000";

	return isRegistered;
}
