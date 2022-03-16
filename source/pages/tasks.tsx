import React from "react";
import { Text, Box, Spacer } from "ink";
import figlet from "figlet";
import { TaskList, Task } from "ink-task-list";

import BaseBorder from "../components/baseBorder";
import { UseInput2 } from "../components/useInput2";
import { ITXInfo, tasksManager } from "../lib/tasks";
import { IWalletInfo } from "../lib/wallets";
import { getContractTag } from "../lib/contract";

// const { contract_address } = require("../../settings/eth_task_settings.js");

interface ITasksToDo {
	label: string;
	status: string;
	state: "pending" | "loading" | "success" | "warning" | "error";
}

const {
	stock_variable,
	contract_address,
} = require("../../settings/eth_task_settings.js");
let manualAproved = false;

// let monitoringGood = false;

const tasks: ITasksToDo[] = [
	{
		label: "Fetch task data",
		status: "",
		state: "loading",
	},
	{
		label: "Fetch ABI",
		status: "",
		state: "pending",
	},
	{
		label: "Manual aproval",
		status: "Approve with A",
		state: "loading",
	},
	{
		label: "Fetch parameters",
		status: "",
		state: "pending",
	},
	{
		label: "Monitoring",
		status: "",
		state: "pending",
	},
	{
		label: "Submit transactions",
		status: "",
		state: "pending",
	},
	{
		label: "Gas management",
		status: "",
		state: "pending",
	},
];

export default class Tasks extends React.Component<
	{ setCurrentPage: (page: string) => void },
	{
		tasks: ITasksToDo[];
		walletsInfo: IWalletInfo[];
		parameters: Record<string, any[]>;
		name: string;
		supply: string;
		taskData: Record<string, ITXInfo>;
	}
> {
	constructor(props: { setCurrentPage: (page: string) => void }) {
		super(props);

		this.state = {
			tasks,
			walletsInfo: [],
			parameters: {},
			name: "",
			supply: "0",
			taskData: {},
		};
		this.updateTask = this.updateTask.bind(this);
	}

	override componentDidMount() {
		// getContractTag()
		this.updateTask("Fetch task data", "", "loading");
		getContractTag(contract_address).then((tag) => {
			if (tag) {
				this.setState({ name: tag });
				this.updateTask("Fetch task data", "", "success");
			}
		});
		tasksManager.startMonitorSupply((supply) => {
			this.setState({ supply });
		});

		tasksManager.update_frontend_task = this.updateTask;
		tasksManager.update_frontend_wallet_info = (w: IWalletInfo[]) => {
			this.setState({ walletsInfo: w });
		};

		tasksManager.update_frontend_parameters = (p: Record<string, any[]>) => {
			this.setState({ parameters: p });
		};

		tasksManager.update_frontend_task_data = (t: Record<string, ITXInfo>) => {
			this.setState({ taskData: t });
		};

		tasksManager.start_task_process();
	}

	updateTask(
		tasklabel: string,
		status: string,
		state: "pending" | "loading" | "success" | "warning" | "error"
	) {
		const tasks = this.state.tasks.map((task) => {
			if (task.label === tasklabel) {
				return { ...task, status, state };
			}
			return task;
		});
		this.setState({ tasks });
	}

	manualApproval() {
		this.updateTask("Manual aproval", "", "loading");
		manualAproved = true;
		if (manualAproved) {
			tasksManager.manual_approving();
			this.updateTask("Manual aproval", "OK", "success");
		}
	}

	override render() {
		return (
			<BaseBorder>
				<UseInput2
					callback={(input) => {
						if (input === "A" || input === "a") {
							this.manualApproval();
						}
					}}
				/>
				<Box display="flex" justifyContent="center" paddingBottom={2}>
					<Text color="blueBright">
						{figlet.textSync("Task", {
							font: "Mini",
						})}{" "}
						eth
					</Text>
				</Box>
				<Box
					paddingBottom={2}
					display="flex"
					justifyContent="space-between"
					width={"75%"}
				>
					<Text color={"cyan"}>Contract : {this.state.name}</Text>
					<Text color={"cyan"}>
						{stock_variable}: {this.state.supply}
					</Text>
				</Box>

				<Box display="flex" justifyContent="space-between">
					<Box
						display="flex"
						flexDirection="column"
						marginBottom={1}
						width={"75%"}
					>
						<Box width={"100%"}>
							<Box width={13}>
								<Text>Name </Text>
							</Box>
							{/* <Box width={17}>
								<Text>Adresse</Text>
							</Box> */}
							<Box width={30}>
								<Text>
									{" -> "}
									Parameters
								</Text>
							</Box>
							<Box>
								<Text>Txs</Text>
							</Box>
						</Box>
						{this.state.walletsInfo.map((wallet) => {
							const text_parameters = this.state.parameters[wallet.name]
								?.map((p) => String(p).slice(0, 7))
								?.join(", ")
								.replace("\n", "");

							const status = this.state.taskData[wallet.name]?.status;
							const message = this.state.taskData[wallet.name]?.message;

							let color = "yellow";

							if (status === "success") {
								color = "green";
							}
							if (status === "failure") {
								color = "red";
							}

							return (
								<Box width={"100%"} key={wallet.name}>
									<Box width={13}>
										<Text>{wallet.name} </Text>
									</Box>
									{/* <Box width={17}>
										<Text>
											{wallet.adresse.slice(0, 6)}...
											{wallet.adresse.slice(36, 42)}
										</Text>
									</Box> */}
									<Box width={30}>
										<Text>
											{" -> "}
											{text_parameters}
										</Text>
									</Box>
									<Box>
										<Text color={color}>{message}</Text>
									</Box>
								</Box>
							);
						})}
					</Box>
					<Box width={"25%"}>
						<TaskList>
							{this.state.tasks.map((task, index) => (
								<Task
									key={index}
									label={task.label}
									status={task.status}
									state={task.state}
								/>
							))}
						</TaskList>
					</Box>
				</Box>

				<Spacer />
			</BaseBorder>
		);
	}
}
