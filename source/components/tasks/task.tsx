import React from "react";
import { Box, Text } from "ink";
import { Transaction } from "../../lib/transaction";
import { IWalletInfo } from "../../lib/wallets";

export const TaskTx = (props: {
	transaction: Transaction;
	parameters: string[];
	wallet: IWalletInfo;
}) => {
	const text_parameters = props.parameters
		?.map((p) => String(p).slice(0, 7))
		?.join(", ")
		.replace("\n", "");

	const status = props.transaction?.status;
	const message = props.transaction?.message;

	let color = "yellow";

	if (status === "success") {
		color = "green";
	}
	if (status === "failure" || status === "error") {
		color = "red";
	}

	return (
		<Box width={"100%"} key={props.wallet.name}>
			<Box width={13}>
				<Text>{props.wallet.name} </Text>
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
				<Text color={color}>{message || "Pending"}</Text>
			</Box>
		</Box>
	);
};
