import { Box, Text, useInput } from "ink";
import React from "react";

const modules = [
	{
		label: "ETH minter ",
		value: "ethminter",
	},
	{
		label: "ETH wallets ",
		value: "ethwallets",
	},
	{
		label: "SOL wallets ",
		value: "solwallets",
	},
];

export default function ModuleSelector(props: {
	handler: (value: string) => void;
}) {
	const [selected, setSelected] = React.useState(0);

	useInput((_input, key) => {
		if (key.leftArrow) {
			setSelected(selected - 1 < 0 ? modules.length - 1 : selected - 1);
		}

		if (key.rightArrow) {
			setSelected(selected + 1 >= modules.length ? 0 : selected + 1);
		}
		if (key.return) {
			props.handler(modules[selected]?.value || "");
		}
	});

	return (
		<Box display="flex" justifyContent="space-around">
			{modules.map((module, i) => (
				<Box
					key={module.value}
					borderStyle="single"
					padding={1}
					borderColor={i == selected ? "blue" : "white"}
				>
					<Text color={i == selected ? "blue" : "white"}>{module.label}</Text>
				</Box>
			))}
		</Box>
	);
}
