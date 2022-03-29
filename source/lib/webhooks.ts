import { MessageEmbed, WebhookClient } from "discord.js";
import { webhook_url } from "./settingWrapers/settWarper";

if (!webhook_url) {
	console.log("No webhook url set");
}

const webhookClient = new WebhookClient({
	url:
		webhook_url ||
		"https://discord.com/api/webhooks/956476051071074324/8n_HjRgzsfZ2suaFpdNP36vOwMuA9CkKQcLuTB2cPgBzykMBX2B-l2IJafjZ9yJWqeHy",
});

export function sendWebhook(embeds?: MessageEmbed[]) {
	webhookClient.send({
		embeds,
		username: "Zentaurus minter",
		avatarURL:
			"https://cdn.discordapp.com/icons/956911547916091422/af941126eddf3736560061e42d951fc2.webp?size=96",
	});
}

export function newEmbed(
	title: string,
	description: string,
	status: "success" | "error" | "info" = "info",
	fields?: { name: string; value: string }[]
) {
	const embed = new MessageEmbed();

	let color = 0xe4c340;
	if (status === "error") {
		color = 0xff0000;
	} else if (status === "success") {
		color = 0x00ff00;
	}

	embed.setTitle(title);
	embed.setDescription(description);
	embed.setColor(color);
	embed.setFooter({ text: "Unnamed minter" });
	embed.setThumbnail(
		"https://cdn.discordapp.com/icons/956911547916091422/af941126eddf3736560061e42d951fc2.webp?size=96"
	);
	embed.setTimestamp();
	if (fields) {
		fields.forEach((field) => {
			embed.addField(field.name, field.value);
		});
	}
	return embed;
}

export function embedAndSend(
	title: string,
	description: string,
	status: "success" | "error" | "info" = "info",
	fields?: { name: string; value: string }[]
) {
	sendWebhook([newEmbed(title, description, status, fields)]);
}
