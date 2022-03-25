import { IWalletInfo } from "./wallets";
import { Contract } from "web3-eth-contract";
import { web3 } from "./web3";
import { embedAndSend } from "./webhooks";
import { etherscanBase } from "../constantes";

type TStatus = "draft" | "pending" | "success" | "failure" | "error";

interface ITXdata {
	wallet: IWalletInfo;
	gas_limit: number;
	nonce: number;
	to: string;
	parameters: any[] | undefined;
	value: number;
	function: string;
}

function send_sent_webhook(
	hash: string,
	tx_data: ITXdata,
	gas_price: number,
	type: string
) {
	embedAndSend(`Transaction ${type} !`, `${etherscanBase}/tx/${hash}`, "info", [
		{
			name: "Price",
			value: tx_data.value.toString(),
		},
		{
			name: "Gas",
			value: gas_price.toString(),
		},
		{
			name: "Wallet",
			value: `||${tx_data.wallet.name}||`,
		},
		{
			name: "Parameters",
			value: tx_data.parameters?.join(", ") || "",
		},
	]);
}

function send_failed_webhook(
	message: string,
	tx_data: ITXdata,
	gas_price: number
) {
	embedAndSend(`Failed !`, message, "error", [
		{
			name: "Price",
			value: tx_data.value.toString(),
		},
		{
			name: "Gas",
			value: gas_price.toString(),
		},
		{
			name: "Wallet",
			value: `||${tx_data.wallet.name}||`,
		},
	]);
}

function send_included_webhook(
	blockNumber: number,
	tx_data: ITXdata,
	gas_price: number
) {
	embedAndSend(
		`Included in block !`,
		`${etherscanBase}block/${blockNumber}`,
		"success",
		[
			{
				name: "Price",
				value: tx_data.value.toString(),
			},
			{
				name: "Gas",
				value: gas_price.toString(),
			},
			{
				name: "Wallet",
				value: `||${tx_data.wallet.name}||`,
			},
			{
				name: "Gas Cost",
				value: tx_data.value.toString(),
			},
		]
	);
}

export class Transaction {
	tx_data: ITXdata;
	hash: string;
	status: TStatus;
	lastupdate: number;
	message: string;

	contract: Contract | undefined;

	current_gas_price: number = 0;

	onUpdate: () => void;

	constructor(
		contract: Contract | undefined,
		data: ITXdata,
		onUpdate: () => void
	) {
		this.tx_data = data;
		this.hash = "";
		this.status = "draft";
		this.lastupdate = Date.now();
		this.message = "";
		this.contract = contract;
		this.onUpdate = onUpdate;
	}

	update_status(status: TStatus, message: string) {
		if (this.status !== "success") {
			this.status = status;
			this.message = message;
			this.lastupdate = Date.now();
			this.onUpdate();
		}
	}

	async sendTx(gas_price: number, type: "speed_up" | "send" = "send") {
		if (!this.contract) {
			console.log("No contract initialised");
			return false;
		}

		try {
			this.contract.methods[this.tx_data.function](
				...(this.tx_data.parameters || [])
			);
		} catch (e: any) {
			const message = e.message.split("\n")[0];
			this.update_status("failure", message);
			console.log("Error sending transaction", e);
			return false;
		}

		this.current_gas_price = gas_price;

		const tx = this.contract.methods[this.tx_data.function](
			...(this.tx_data.parameters || [])
		);

		const gas_price_wei = web3.utils.toWei(gas_price.toString(), "gwei");

		const options = {
			from: this.tx_data.wallet.adresse,
			gas: this.tx_data.gas_limit,
			gasPrice: gas_price_wei,
			to: tx._parent._address,
			data: tx.encodeABI(),
			value: web3.utils.toWei(this.tx_data.value.toString(), "ether"),
			nonce: this.tx_data.nonce,
		};

		const signed = await web3.eth.accounts.signTransaction(
			options,
			this.tx_data.wallet.pk
		);

		web3.eth
			.sendSignedTransaction(
				signed.rawTransaction || "",
				(err: any, hash: string) => {
					if (err) {
						console.log(err, "ici wtf?");
					} else {
						console.log(
							`Transaction sent ! Gwei : ${gas_price} | Hash : ${hash} | data :` +
								this.tx_data.parameters
						);
						this.hash = hash;

						this.update_status(
							"pending",
							`${gas_price} Gwei | Hash : ${hash} `
						);
						send_sent_webhook(this.hash, this.tx_data, gas_price, type);
					}
				}
			)
			.then((receipt) => {
				const price = web3.utils.fromWei(
					(Number(gas_price_wei) * receipt.gasUsed).toString(),
					"ether"
				);

				const message = `Included in block ${receipt.blockNumber} | Cost : ${price} ETH`;

				send_included_webhook(receipt.blockNumber, this.tx_data, gas_price);
				this.update_status("success", message);
				console.log(message);
			})
			.catch((err) => {
				let message = "";
				let errorType: "error" | "failure" = "error";
				if (err.data === null) {
					message = err.message.split("at")[0];
				} else {
					errorType = "failure";
					const errem = err.message.split(":")[0];
					const price = web3.utils.fromWei(
						(Number(gas_price_wei) * err.receipt.gasUsed).toString(),
						"ether"
					);
					message = `${errem} | Cost : ${price} ETH`;
				}

				send_failed_webhook(message, this.tx_data, gas_price);
				this.update_status(errorType, message);
				console.log(message);
			});
		return true;
	}

	speed_up(gas_price: number) {
		if (this.status === "success" || this.status === "failure") {
			console.log("Transaction already succeded or failed");

			return [false, true];
		}
		if (this.current_gas_price * 1.102 > gas_price) {
			return [false, false];
		}
		console.log(this.current_gas_price, gas_price);

		this.current_gas_price = gas_price;
		this.sendTx(gas_price, "speed_up");
		return [true, false];
	}
}
