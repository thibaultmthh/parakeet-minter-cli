import { getContractABI } from "./contract";
import { getWallets, IWalletInfo } from "./wallets";
import { web3 } from "./web3";
import { Contract } from "web3-eth-contract";

import { getTaskGasPrice, getTaskGasWarPrice } from "./gas";

const {
	task_wallets,
	parameters,
	monitoring_strategie,
	contract_address,
	fetch_parameters_retry_delay,
	stock_variable,
	parameters_validation,
	gas_limit,
	function_name,
	value,
	gas_war_strategie,
} = require("../../settings/eth_task_settings.js");

export interface ITXInfo {
	wallet: IWalletInfo;
	gas_limit: number;
	gas_price: number;
	nonce: number;
	to: string;
	parameters: any[];
	value: number;
	hash: string;
	status: "draft" | "pending" | "success" | "failure";
	lastupdate: number;
	message: string;
}

class TasksManager {
	wallets: IWalletInfo[];
	contract: Contract | undefined;
	parameters_per_wallets: Record<string, any[]>;
	supply: string;
	monitor_passed: boolean;
	manual_approved: boolean;
	transaction: Record<string, ITXInfo>;

	update_frontend_wallet_info: (w: IWalletInfo[]) => void;
	update_frontend_parameters: (p: Record<string, any[]>) => void;
	update_frontend_task: (
		tasklabel: string,
		status: string,
		state: "pending" | "loading" | "success" | "warning" | "error"
	) => void;

	update_frontend_task_data: (data: Record<string, ITXInfo>) => void;
	gas_updated: number;

	constructor() {
		this.wallets = [];
		this.contract = undefined;
		this.parameters_per_wallets = {};
		this.supply = "0";
		this.monitor_passed = false;
		this.manual_approved = false;
		this.transaction = {};

		this.gas_updated = 0;

		this.update_frontend_wallet_info = () => {};
		this.update_frontend_parameters = () => {};
		this.update_frontend_task = () => {};
		this.update_frontend_task_data = () => {};
	}

	async check_and_start_tasks() {
		if (this.monitor_passed && this.manual_approved) {
			this.update_frontend_task("Submit transactions", "", "loading");
			//Generate transaction data:
			const gas_price = getTaskGasPrice();

			for (let i = 0; i < this.wallets.length; i++) {
				const wallet = this.wallets[i];
				if (wallet) {
					const nonce = await web3.eth.getTransactionCount(wallet.adresse);
					const data: ITXInfo = {
						wallet,
						gas_limit,
						gas_price,
						to: contract_address,
						parameters: this.parameters_per_wallets[wallet.name] || [],
						value,
						hash: "",
						status: "draft",
						nonce,
						lastupdate: Date.now(),
						message: "",
					};
					this.transaction[wallet.name] = data;
					this.taskWrite(data);
					this.update_frontend_task(
						"Submit transactions",
						`[${i}/${this.wallets.length}]`,
						"pending"
					);
				}
			}
			this.update_frontend_task(
				"Submit transactions",
				`${this.wallets.length}/${this.wallets.length}`,
				"success"
			);
			this.update_frontend_task("Gas management", "", "loading");

			setInterval(() => {
				this.applyGasStrategy();
			}, gas_war_strategie.resend * 1000);
		}
	}

	manual_approving() {
		this.manual_approved = true;
		this.check_and_start_tasks();
	}

	update_task_status(name: string, newdata: Record<string, any>) {
		const keys = Object.keys(newdata);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			if (key) {
				// @ts-ignore
				this.transaction[name][key] = newdata[key];
			}
		}
		// console.log(this.transaction);

		//
		this.update_frontend_task_data(this.transaction);
	}

	// Loadings
	async loadContract() {
		return new Promise<string>(async (resolve, reject) => {
			if (this.contract) {
				resolve(contract_address);
				return;
			}
			const abi = await getContractABI(contract_address);
			if (abi) {
				try {
					this.contract = new web3.eth.Contract(
						JSON.parse(abi),
						contract_address
					);
				} catch (e) {
					console.log(e);
					reject(e);
				}
				resolve(contract_address);
			}
			reject("Could not load contract");
		});
	}

	async loadTaskWallets() {
		return new Promise<IWalletInfo[]>(async (resolve) => {
			if (this.wallets.length > 0) {
				resolve(this.wallets);
				return;
			}
			const allWallets = getWallets();
			const filteredWallets = allWallets.filter((wallet) =>
				task_wallets.includes(wallet.name)
			);

			for (let i = 0; i < filteredWallets.length; i++) {
				const wallet = filteredWallets[i];

				if (wallet) {
					this.wallets.push(wallet);
				}
			}

			resolve(this.wallets);
		});
	}

	async fetchParameters() {
		return new Promise<Record<string, any[]>>(async (resolve, reject) => {
			for (let i = 0; i < this.wallets.length; i++) {
				const wallet = this.wallets[i];
				if (wallet) {
					const i = setInterval(async () => {
						try {
							if (this.parameters_per_wallets[wallet.name]) {
								clearInterval(i);
								let wallets_done = Object.keys(
									this.parameters_per_wallets
								).length;

								if (wallets_done === this.wallets.length) {
									resolve(this.parameters_per_wallets);
								} else {
									this.update_frontend_task(
										"Fetch parameters",
										`${wallets_done}/${this.wallets.length}`,
										"loading"
									);
								}
								return;
							}
							const params = await parameters(wallet.adresse);
							const validation = await parameters_validation(params);

							if (validation) {
								clearInterval(i);
								try {
									this.contract?.methods[function_name](...params);
								} catch (e: any) {
									const message = e.message.split("\n")[0];
									this.update_frontend_task(
										"Fetch parameters",
										`${message}`,
										"error"
									);
									reject();
									return;
								}
								this.parameters_per_wallets[wallet.name] = params;
								let wallets_done = Object.keys(
									this.parameters_per_wallets
								).length;

								if (wallets_done === this.wallets.length) {
									resolve(this.parameters_per_wallets);
								} else {
									this.update_frontend_task(
										"Fetch parameters",
										`${wallets_done}/${this.wallets.length}`,
										"loading"
									);
								}
							}
						} catch (e) {
							console.log("Error fetch parameters", wallet.adresse);

							console.log(e);
						}
					}, fetch_parameters_retry_delay);
				}
			}
		});
	}

	// Intervals
	async startMonitorSupply(callback: (stock: string) => void) {
		try {
			tasksManager.supply =
				(await tasksManager.contract!.methods[stock_variable]().call()) || "0";
			callback(tasksManager.supply || "x");
		} catch (e) {}
		setInterval(async () => {
			try {
				tasksManager.supply =
					(await tasksManager.contract!.methods[stock_variable]().call()) ||
					"0";
				callback(tasksManager.supply || "x");
			} catch (e) {}
		}, 6000);
	}

	async monitoring(callback: (message: string) => void) {
		return new Promise<void>((resolve) => {
			if (monitoring_strategie.use === "variable") {
				const i = setInterval(async () => {
					try {
						const r =
							(await this.contract!.methods[
								monitoring_strategie.variable_monitoring.variable
							]().call()) || "x";
						if (r == monitoring_strategie.variable_monitoring.expected_value) {
							clearInterval(i);
							resolve();
						} else {
							callback(
								`${r} != ${monitoring_strategie.variable_monitoring.expected_value}`
							);
						}
					} catch (e) {
						console.log(e);
						callback("Error monitoring");
					}
				}, monitoring_strategie.delay * 1000);
			} else {
				const func = async () => {
					const r = await monitoring_strategie.custom_monitoring();
					if (r) {
						clearInterval(i);
						resolve();
					} else {
						callback("Custom monitoring");
					}
				};
				func();
				const i = setInterval(func, monitoring_strategie.delay * 1000);
			}
		});
	}

	// Transactions
	async taskWrite(data: ITXInfo) {
		if (!this.contract) {
			console.log("No contract initialised");

			return;
		}

		try {
			this.contract.methods[function_name](...data.parameters);
		} catch (e: any) {
			const message = e.message.split("\n")[0];
			this.update_task_status(data.wallet.name, {
				lastupdate: Date.now(),
				status: "failure",
				message: `${message} `,
			});

			return;
		}

		const tx = this.contract.methods[function_name](...data.parameters);

		const options = {
			from: data.wallet.adresse,
			gas: data.gas_limit,
			gasPrice: web3.utils.toWei(data.gas_price.toString(), "gwei"),
			to: tx._parent._address,
			data: tx.encodeABI(),
			value: web3.utils.toWei(data.value.toString(), "ether"),
			nonce: data.nonce,
		};

		const signed = await web3.eth.accounts.signTransaction(
			options,
			data.wallet.pk
		);

		web3.eth
			.sendSignedTransaction(
				signed.rawTransaction || "",
				(err: any, hash: string) => {
					if (err) {
						console.log(err);
					} else {
						console.log(
							`Transaction sent ! Gwei : ${data.gas_price} | Hash : ${hash} | data :` +
								data.parameters
						);
						this.update_task_status(data.wallet.name, {
							lastupdate: Date.now(),
							status: "pending",
							message: `${data.gas_price} Gwei | Hash : ${hash} `,
						});
					}
				}
			)
			.then((receipt) => {
				const price = web3.utils.fromWei(
					(
						Number(web3.utils.toWei(data.gas_price.toString(), "gwei")) *
						receipt.gasUsed
					).toString(),
					"ether"
				);

				const message = `Included in block ${receipt.blockNumber} | Cost : ${price} ETH`;
				this.update_task_status(data.wallet.name, {
					lastupdate: Date.now(),
					status: "success",
					message,
				});
				console.log(message);
			})
			.catch((err) => {
				let message = "";
				if (err.data === null) {
					message = err.message.split("at")[0];
				} else {
					const errem = err.message.split(":")[0];
					const price = web3.utils.fromWei(
						(
							Number(web3.utils.toWei(data.gas_price.toString(), "gwei")) *
							err.receipt.gasUsed
						).toString(),
						"ether"
					);
					message = `${errem} | Cost : ${price} ETH`;
				}
				this.update_task_status(data.wallet.name, {
					lastupdate: Date.now(),
					status: "failure",
					message,
				});
				console.log(message);
			});
	}

	async applyGasStrategy() {
		const newGas = getTaskGasWarPrice();
		let sentNewTxs = false;
		let allTxDone = true;
		for (let i = 0; i < this.wallets.length; i++) {
			const wallet = this.wallets[i];
			if (wallet && this.transaction[wallet.name] !== undefined) {
				const oldgas = this.transaction[wallet.name]?.gas_price || 0;
				const alreadyDone =
					this.transaction[wallet.name]?.status === "success" ||
					this.transaction[wallet.name]?.status === "failure";
				// @ts-expect-error
				this.transaction[wallet.name].gas_price = newGas;

				if (oldgas !== newGas && !alreadyDone) {
					// @ts-expect-error
					this.taskWrite(this.transaction[wallet.name]);
					sentNewTxs = true;
				}

				if (!alreadyDone) {
					allTxDone = false;
				}
			}
		}
		if (sentNewTxs) {
			this.gas_updated += 1;
		}

		if (!allTxDone) {
			this.update_frontend_task(
				"Gas management",
				`${this.gas_updated} Update`,
				"loading"
			);
		} else {
			this.update_frontend_task(
				"Gas management",
				`${this.gas_updated}`,
				"success"
			);
		}
	}

	async start_task_process() {
		this.update_frontend_task("Fetch ABI", "", "loading");
		//1. load the contract
		this.loadContract()
			.then(() => {
				this.update_frontend_task("Fetch ABI", "OK", "success");
				//2. load the wallets
				this.loadTaskWallets().then((w) => {
					if (w.length <= 0) {
						this.update_frontend_task("Fetch task data", "No wallets", "error");
					} else {
						this.update_frontend_wallet_info(w);
						this.update_frontend_task("Fetch task data", "OK", "success");
						this.update_frontend_task("Fetch parameters", ``, "loading");

						//3. Wait for parameters
						tasksManager.fetchParameters().then((r) => {
							this.update_frontend_parameters(r);
							this.update_frontend_task("Fetch parameters", "OK", "success");
							this.update_frontend_task("Monitoring", "", "loading");

							//4. Wait for monitoring
							tasksManager
								.monitoring((message) => {
									this.update_frontend_task("Monitoring", message, "loading");
								})
								.then(() => {
									this.update_frontend_task("Monitoring", "OK", "success");
									this.monitor_passed = true;
									this.check_and_start_tasks();
								});
						});
					}
				});
			})
			.catch(() => {
				this.update_frontend_task("Fetch ABI", "ERROR", "error");
			});
	}
}

export const tasksManager = new TasksManager();
// Object.freeze(tasksManager);
