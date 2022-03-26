import fs from "fs";

const eth_task_file = fs.readFileSync(
	process.cwd() + "/settings/eth_task_settings.js",
	"utf8"
);

const data = eval("(" + eth_task_file + ")")();

export const {
	task_wallets,
	contract_address,
	function_name,
	value,
	gas_limit,
	parameters,
	parameters_validation,
	gas_price,
	stock_variable,
	gas_war_strategie,
	monitoring_strategie,
	fetch_parameters_retry_delay,
} = data as {
	task_wallets: string[];
	contract_address: string;
	function_name: string;
	value: number;
	gas_limit: number;
	parameters: (adresse: string) => Promise<any[]>;
	parameters_validation: (parameters: any[]) => Promise<boolean>;
	gas_price: string;
	stock_variable: string;
	gas_war_strategie: {
		resend: number;
		gas_price: string;
		max_gas_price: number;
	};
	monitoring_strategie: {
		delay: number;

		use: ("variable" | "function" | "stock")[];
		variable_monitoring: {
			variable: string;
			expected_value: any;
		};
		stock_monitoring: {
			over: number;
			under: number;
		};
		custom_monitoring: () => boolean;
	};
	fetch_parameters_retry_delay: number;
};
