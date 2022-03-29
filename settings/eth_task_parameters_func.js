() => {
	const parameters = async (adresse) => {
		// const options = {
		// 	method: 'POST',
		// 	url: 'https://bobu.azuki.com/api/generate_signature',
		// 	headers: { 'Content-Type': 'application/json' },
		// 	data: { address: adresse }
		// };
		// return new Promise(async (resolve, reject) => {
		// 	axios.request(options).then(function (response) {
		// 		try {
		// 			resolve([1, response.data.signature]);
		// 		}
		// 		catch (e) {
		// 			reject(e);
		// 		}
		// 	}).catch(function (error) {
		// 		console.error(error);
		// 		reject(error);
		// 	});
		// });
		// const data = ["val1", "val2"];

		return new Promise(async (resolve, reject) => {
			resolve([3]);
		});
	};

	return parameters
}
