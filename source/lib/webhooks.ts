import { MessageEmbed, WebhookClient } from "discord.js";
const { webhook_url } = require("../../settings/settings.json");

const webhookClient = new WebhookClient({ url: webhook_url });

export function sendWebhook(embeds?: MessageEmbed[]) {
	webhookClient.send({
		embeds,
		username: "Unnamed minter",
		avatarURL:
			"https://cdn.discordapp.com/attachments/943243067492823130/952903899784822854/unnamed_nft.png",
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
	embed.setFooter("Unnamed minter");
	embed.setThumbnail(
		"https://cdn.discordapp.com/attachments/943243067492823130/952903899784822854/unnamed_nft.png"
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