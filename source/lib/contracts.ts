import axios from "axios";
import fs from "fs";

import cheerio from "cheerio";
import { etherscan_api_link } from "../constantes";
import { etherscan_api_key } from "./settingWrapers/settWarper";

import { Contract } from "web3-eth-contract";
import { web3 } from "./web3";

const abiPath = `${process.cwd()}/data/abi/`;

let contracts: Record<string, Contract> = {};

export async function getContractABI(adresse: string) {
	const abis = fs.readdirSync(abiPath);
	const abi = abis.find((abi) => abi.includes(adresse));
	if (abi) {
		const abiData = JSON.parse(fs.readFileSync(`${abiPath}${abi}`, "utf8"));
		console.log(`ABI found for ${adresse}`);

		return abiData;
	}
	const url = `https://${etherscan_api_link}/api?module=contract&action=getabi&address=${adresse}&apikey=${etherscan_api_key}`;
	const abiFetched = await axios.get(url);
	if (abiFetched.data.status === "1") {
		fs.writeFileSync(
			`${abiPath}${adresse}.json`,
			JSON.stringify(abiFetched.data.result)
		);
		console.log(`ABI fetched for ${adresse}`);

		return abiFetched.data.result;
	}
	console.log(`ABI not found for ${adresse}`, abiFetched.data, url);

	return false;
}

const indexedContracts = JSON.parse(
	fs.readFileSync(process.cwd() + "/data/indexedContracts.json", "utf8")
) as Record<string, string>;

export async function getContractTag(address: string) {
	if (indexedContracts[address]) {
		return indexedContracts[address];
	}
	const content = await axios.get(`https://etherscan.io/address/${address}`);
	const $ = cheerio.load(content.data);

	const result = ($("meta[property='og:title']")
		.attr("content")
		?.split("|")[0] || "") as string;
	if (!result.includes("Contract")) {
		indexedContracts[address] = result;
		fs.writeFileSync(
			process.cwd() + "/data/indexedContracts.json",
			JSON.stringify(indexedContracts)
		);
	}
	return result;
}

export function loadContract(adresse: string) {
	return new Promise<Contract>(async (resolve, reject) => {
		if (contracts[adresse]) {
			resolve(contracts[adresse] as Contract);
			return;
		}
		const abi = await getContractABI(adresse);
		if (abi) {
			try {
				const contract = new web3.eth.Contract(JSON.parse(abi), adresse);
				contracts[adresse] = contract;
				resolve(contract);
			} catch (e) {
				console.log(e);
				reject(e);
			}
		}
		reject("Could not load contract");
	});
}
