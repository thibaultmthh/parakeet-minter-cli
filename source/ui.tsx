import React, { FC } from "react";

import Index from "./pages";
import EthWallets from "./pages/ethWallets";
import Tasks from "./pages/tasks";

const App: FC<{ name?: string }> = () => {
	const [currentPage, setCurrentPage] = React.useState<string>("index");
	if (currentPage === "index") {
		return <Index setCurrentPage={setCurrentPage} />;
	}
	if (currentPage === "ethwallets") {
		return <EthWallets setCurrentPage={setCurrentPage} />;
	}
	if (currentPage === "ethminter") {
		return <Tasks setCurrentPage={setCurrentPage} />;
	}
	return null;
};

module.exports = App;
export default App;
