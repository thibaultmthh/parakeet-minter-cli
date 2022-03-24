import React from "react";
import { Text, Box, Spacer } from "ink";
import figlet from "figlet";

import BaseBorder from "../components/baseBorder";
import { getWalletInfo, getWallets } from "../lib/wallets";

interface IState {
	wallets: { pk: string; adresse: string; name: string }[];
	walletsInfo: Record<
		string,
		{ balance: number; nonce: number; isOpenseaRegistered: boolean }
	>;
}

export default class EthWallets extends React.Component<
	{
		setCurrentPage: (page: string) => void;
	},
	IState
> {
	constructor(props: { setCurrentPage: (page: string) => void }) {
		super(props);
		this.state = { wallets: [], walletsInfo: {} };
	}

	override componentDidMount() {
		const wallets = getWallets();
		this.setState({ wallets });

		for (const wallet of wallets) {
			getWalletInfo(wallet.adresse).then((info) => {
				this.setState((prevState) => ({
					walletsInfo: {
						...prevState.walletsInfo,
						[wallet.adresse]: {
							balance: info.balance,
							nonce: info.nonce,
							isOpenseaRegistered: info.isOpenseaRegistered,
						},
					},
				}));
			});
		}
	}

	override render() {
		const sold_total = this.state.wallets.reduce((acc, wallet) => {
			return acc + (this.state.walletsInfo[wallet.adresse]?.balance || 0);
		}, 0);

		return (
			<BaseBorder>
				<Box display="flex" justifyContent="center" paddingBottom={2}>
					<Text color="blueBright">
						{figlet.textSync("Wallets", {
							font: "Mini",
						})}{" "}
						eth
					</Text>
				</Box>
				<Box>
					<Box display="flex" flexDirection="column">
						<Box paddingBottom={0} borderStyle="classic" display="flex">
							<Box width={20}>
								<Text>Name </Text>
							</Box>
							<Box width={55}>
								<Text>Adresse </Text>
							</Box>
							<Box width={"14%"}>
								<Text>Balance </Text>
							</Box>
							<Box width={"14%"}>
								<Text>Nonce </Text>
							</Box>
							<Box width={"14%"} justifyContent="center">
								<Text>Opensea </Text>
							</Box>
						</Box>
						{this.state.wallets.map((wallet) => (
							<Box
								key={wallet.pk}
								paddingBottom={0}
								borderStyle="classic"
								display="flex"
							>
								<Box width={20}>
									<Text backgroundColor={"#282D35"}>{wallet.name}</Text>
								</Box>
								<Box width={55}>
									<Text>{wallet.adresse}</Text>
								</Box>
								<Box width={"14%"}>
									<Text>
										{this.state.walletsInfo[wallet.adresse]?.balance || 0}
									</Text>
								</Box>
								<Box width={"14%"}>
									<Text>
										{this.state.walletsInfo[wallet.adresse]?.nonce || 0}
									</Text>
								</Box>
								<Box width={"14%"} justifyContent="center">
									<Text
										backgroundColor={
											this.state.walletsInfo[wallet.adresse]
												?.isOpenseaRegistered
												? "green"
												: "red"
										}
									>
										{"   "}
									</Text>
								</Box>
							</Box>
						))}
					</Box>
					<Box display="flex" justifyContent="flex-end">
						<Box padding={2} width={"45%"} marginRight={3}>
							<Text>Total = {Math.round(sold_total * 1000) / 1000}</Text>
						</Box>
					</Box>
				</Box>

				<Spacer />
			</BaseBorder>
		);
	}
}
