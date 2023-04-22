const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, Colors } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Shows my Ping.'),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		interaction.editReply({ content: 'Pinging', fetchReply: true, ephemeral: true }).then((msg) => {
			const ping = msg.createdTimestamp - interaction.createdTimestamp;
			const latency = Date.now() - interaction.createdTimestamp;
			const api = Math.round(interaction.client.ws.ping);

			const embed = new EmbedBuilder()
				.setTitle('Pong!')
				.setDescription(`Ping is \`${ping}ms\``)
				.addFields({ name: 'Latency is ', value: `\`\`\`ini\n[${latency}ms]\n\`\`\``, inline: true }, { name: 'API Latency is', value: `\`\`\`ini\n[${api}ms]\n\`\`\``, inline: true });

			if (latency < 300 && latency !== 0) {
				embed.setColor(Colors.Green);
				embed.addFields({ name: 'Status', value: 'Normal', inline: false });
			}
			if (latency > 300 && latency < 500) {
				embed.setColor(Colors.Yellow);
				embed.addFields({ name: 'Status', value: 'Minor', inline: false });
			}
			if (latency > 500 && latency < 700) {
				embed.setColor(Colors.Orange);
				embed.addFields({ name: 'Status', value: 'Major', inline: false });
			}
			if (latency > 800) {
				embed.setColor(Colors.Red);
				embed.addFields({ name: 'Status', value: 'Critical', inline: false });
			}
			if (latency === 1) {
				embed.setColor(Colors.Grey);
				embed.addFields({ name: 'Status', value: 'Error', inline: false });
			}
			interaction.editReply({ content: 'Pinged', embeds: [embed], ephemeral: true });
		});
	},
};