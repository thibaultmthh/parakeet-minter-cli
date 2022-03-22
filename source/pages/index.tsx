import React from "react";
import { Box, Spacer } from "ink";
// import figlet from "figlet";
import Gradient from "ink-gradient";
import BigText from "ink-big-text";
import ModuleSelector from "../components/moduleSelector";
import BaseBorder from "../components/baseBorder";

export default class Index extends React.Component<
	{ setCurrentPage: (page: string) => void },
	{}
> {
	constructor(props: { setCurrentPage: (page: string) => void }) {
		super(props);
	}

	override render() {
		return (
			<BaseBorder>
				<Box display="flex" justifyContent="center">
					<Gradient name="retro">
						<BigText text="Zentaurus" font="block" />
					</Gradient>
				</Box>

				<Spacer />
				<ModuleSelector
					handler={(v) => {
						this.props.setCurrentPage(v);
					}}
				/>
			</BaseBorder>
		);
	}
}
