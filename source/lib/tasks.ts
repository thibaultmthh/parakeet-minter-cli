import { loadContract } from "./contracts";
import { getWallets, IWalletInfo } from "./wallets";
import { web3 } from "./web3";
import { Contract } from "web3-eth-contract";

import { getTaskGasPrice, getTaskGasWarPrice } from "./gas";

import { eth_task_settings } from "./settingWrapers/ethTaskWraper";

import { Transaction } from "./transaction";
import { monitoring, startMonitorSupply } from "./monitoring";

class TasksManager {
	wallets: IWalletInfo[];
	contract: Contract | undefined;
	parameters_per_wallets: Record<string, any[]>;
	supply: string;
	monitor_passed: boolean;
	manual_approved: boolean;
	transaction: Record<string, Transaction>;

	update_frontend_wallet_info: (w: IWalletInfo[]) => void;
	update_frontend_parameters: (p: Record<string, any[]>) => void;
	update_frontend_task: (
		tasklabel: string,
		status: string,
		state: "pending" | "loading" | "success" | "warning" | "error"
	) => void;

	update_frontend_task_data: (data: Record<string, Transaction>) => void;
	gas_updated: number;

	gaswar_timer: NodeJS.Timer | undefined;

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

					this.transaction[wallet.name] = new Transaction(
						this.contract,
						{
							wallet,
							gas_limit: eth_task_settings.advenced.gas_limit,
							to: eth_task_settings.contract.contract_address,
							parameters: this.parameters_per_wallets[wallet.name],
							value: eth_task_settings.contract.value,
							nonce,
							function: eth_task_settings.contract.function_name,
						},
						() => {
							this.update_frontend_task_data(this.transaction);
						}
					);

					this.transaction[wallet.name]?.sendTx(gas_price);
					// this.taskWrite(data);
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

			this.gaswar_timer = setInterval(() => {
				this.applyGasStrategy();
			}, eth_task_settings.gas.war.resend * 1000);
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
	async loadTaskContract() {
		const adresse = eth_task_settings.contract.contract_address;
		return new Promise<string>(async (resolve, reject) => {
			if (this.contract) {
				resolve(adresse);
				return;
			}
			try {
				const contract = await loadContract(adresse);
				this.contract = contract;
				resolve(adresse);
			} catch (e) {
				console.log(e);
				reject(e);
			}
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
				eth_task_settings.wallets.includes(wallet.name)
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
							const params = await eth_task_settings.contract.parameters;
							// const validation = await parameters_validation(params);
							const validation = true;

							if (validation) {
								clearInterval(i);
								try {
									this.contract?.methods[
										eth_task_settings.contract.function_name
									](...params);
								} catch (e: any) {
									console.log(e);

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
					}, 1000);
				}
			}
		});
	}

	// Intervals
	async startMonitorSupply(callback: (stock: string) => void) {
		startMonitorSupply(callback);
	}

	async monitoring(callback: (message: string) => void) {
		return monitoring(callback);
	}

	async applyGasStrategy() {
		const newGas = getTaskGasWarPrice();
		let sentNewTxs = false;
		let allTxDone = true;
		for (let i = 0; i < this.wallets.length; i++) {
			const wallet = this.wallets[i];

			const [sent, done] = this.transaction[wallet?.name || ""]?.speed_up(
				newGas
			) || [false, false];

			if (!done) {
				allTxDone = false;
			}
			if (sent) {
				sentNewTxs = true;
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
			if (this.gaswar_timer) {
				clearTimeout(this.gaswar_timer);
			}
		}
	}

	async start_task_process() {
		this.update_frontend_task("Fetch ABI", "", "loading");
		//1. load the contract
		this.loadTaskContract()
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
