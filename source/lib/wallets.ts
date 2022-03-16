import fs from "fs";
import { isOpenseaRegistered } from "./opensea";
import { web3, WEI } from "./web3";

export interface IWalletInfo {
	name: string;
	pk: string;
	adresse: string;
}

export function getWallets(): IWalletInfo[] {
	const wallets = fs
		.readFileSync("settings/wallets.csv", "utf8")
		.split("\n")
		.slice(1);
	const walletList = wallets
		.filter((wallet) => wallet.split(",").length === 2)
		.map((wallet) => {
			const [name, pk] = wallet.split(",") as [string, string];

			return {
				name,
				pk,
				adresse: getWalletAdressFromPrivateKey(pk),
			};
		});

	return walletList;
}

export function getWalletAdressFromPrivateKey(privateKey: string) {
	const adresse = web3.eth.accounts.privateKeyToAccount(privateKey).address;
	return adresse;
}

export async function getWalletInfo(adresse: string) {
	return {
		balance:
			Math.round((Number(await web3.eth.getBalance(adresse)) / WEI) * 1000) /
			1000,
		nonce: Number(await web3.eth.getTransactionCount(adresse)),
		isOpenseaRegistered: await isOpenseaRegistered(adresse),
	};
}
