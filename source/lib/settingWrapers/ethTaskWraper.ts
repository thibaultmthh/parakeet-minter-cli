import fs from "fs";
import toml from "toml";

interface IConfig {
	wallets: string[];
	contract: {
		contract_address: string;
		function_name: string;
		value: number;
		parameters: any[];
		advenced: {
			stock_variable: string;
		};
	};
	gas: {
		start_gas: string;
		war: {
			resend: number;
			new_gas: string;
			max_gas_price: number;
		};
	};
	monitoring: {
		delay: number;
		use: string[];
		variable: {
			variable: string;
			expected_value: boolean;
		};
		stock: {
			over: number;
			under: number;
		};
	};
	cancel: {
		delay_checks: number;
		use: ("gas" | "stock")[];
		gas: {
			fast_over: number;
			slow_over: number;
		};
		stock: {
			over: number;
		};
	};
	advenced: {
		gas_limit: number;
	};
}

// const eth_task_file = fs.readFileSync(
// 	process.cwd() + "/settings/eth_task_settings.js",
// 	"utf8"
// );

// const data = eval("(" + eth_task_file + ")")();

const eth_task_file2 = fs.readFileSync(
	process.cwd() + "/settings/eth_task_settings.toml",
	"utf8"
);

export const eth_task_settings = toml.parse(eth_task_file2) as IConfig;
