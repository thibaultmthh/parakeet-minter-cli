import { machineId } from "node-machine-id";
import axios from "axios";

const API_KEY = "pk_tXn2IbDK7wQ2GgwGLmWYcasNLfGme6ON";

function log(content: any) {
	const now = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
	console.log(now, content);
}

async function getLicense(license: string) {
	return axios
		.get(`https://api.hyper.co/v4/licenses/${license}`, {
			headers: { Authorization: `Bearer ${API_KEY}` },
		})
		.then((response) => response.data)
		.catch(() => {
			return null;
		});
}

async function updateLicense(license: string, hwid: string) {
	return axios
		.patch(
			`https://api.hyper.co/v4/licenses/${license}`,
			{
				metadata: { hwid },
			},
			{ headers: { Authorization: `Bearer ${API_KEY}` } }
		)
		.then((response) => response.data)
		.catch((e) => console.log(e));
}

export default async function checkLicense(license: string) {
	log("Checking license...");
	const licenseData = await getLicense(license);
	if (licenseData?.user) {
		const hwid = await machineId();
		if (Object.keys(licenseData.metadata).length === 0) {
			log(await updateLicense(license, hwid));

			log("Updating license");
			const good = await getLicense(license);
			return good;
		}
		const currentHwid = licenseData.metadata.hwid;
		if (currentHwid === hwid) {
			// log(licenseData.user);

			const userInfo = licenseData.user;
			// settings.setD("userAccountData", {
			// 	email: userInfo.email,
			// 	username: userInfo.username,
			// });
			log({ email: userInfo.email, username: userInfo.username });

			// if (["Q0NR-AI5A-W48G-UPHB", "WUYU-7BH9-6Q36-OROW"].includes(license)) {
			// 	const accessRules = settings.getD("accessRules");
			// 	accessRules.discord = true;
			// 	settings.setD("accessRules", accessRules);
			// }
			log("License is good to go!");

			return { status: true, error: "" };
		}
		log("License is already in use on another machine!");
		return {
			status: false,
			error: "License is already in use on another machine!",
		};
	}
	if (!licenseData) {
		log("License not found.");
		return {
			status: false,
			error: "License not found.",
		};
	}
	if (!licenseData.user) {
		log("License not bound.");
		return {
			status: false,
			error: "License not bound.",
		};
	}
	console.log(licenseData);

	return {
		status: false,
		error: "WTF?",
	};
}
