import { Box, Text } from "ink";
import React from "react";
import { gasManager, getTaskGasPrice } from "../lib/gas";
import { getLastBlockInfo } from "../lib/web3";
const { version } = require("../../package.json");

export default function BaseBorder(props: { children: any }) {
	const [slow, setGas] = React.useState(0);
	const [fast, setFastGas] = React.useState(0);
	const [lastBlockInfo, setLastBlockInfo] = React.useState({
		number: 0,
		timestamp: Date.now(),
	});

	React.useEffect(() => {
		const interval = setInterval(async () => {
			const gas = gasManager.getGas();
			if (gas.fast !== fast) {
				setFastGas(gas.fast);
			}

			if (gas.slow !== slow) {
				setGas(gas.slow);
			}
			const newBlock = await getLastBlockInfo();
			if (newBlock.number !== lastBlockInfo.number) {
				setLastBlockInfo(newBlock);
			}
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	return (
		<Box
			// minHeight={process.stdout.rows - 7}
			minHeight={20}
			borderStyle="round"
			display="flex"
			flexDirection="column"
			borderColor={"greenBright"}
			paddingLeft={1}
			paddingRight={1}
		>
			{props.children}
			<Box
				display="flex"
				justifyContent="space-between"
				paddingLeft={2}
				marginTop={1}
			>
				<Box>
					<Text color={"red"}>slow : {slow} | </Text>
					<Text color={"red"}>fast : {fast} | </Text>
					<Text color={"redBright"}>task : {getTaskGasPrice()} |</Text>
					<Text color={"red"}> block : {lastBlockInfo.number} | </Text>
					<Text color={"red"}>
						{Math.round(Date.now() / 1000 - lastBlockInfo.timestamp)}s ago
					</Text>
				</Box>
				<Box>
					<Text color={"redBright"}> v{version} </Text>
				</Box>
			</Box>
		</Box>
	);
}
