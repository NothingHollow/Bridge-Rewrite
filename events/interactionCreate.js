const { botInfo } = require('../config.json');
const { WebhookClient, EmbedBuilder } = require('discord.js');
const blacklistSchema = require('../models/Blacklist');

module.exports = {
	name: 'interactionCreate',
	on: true,
	async execute(interaction) {
		if (!interaction.isCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) return;

		const data = {};

		// Gets the data of the user
		const userData = await interaction.client.database.fetchUser(interaction.user.id);
		data.userData = userData;

		if (interaction.commandName.startsWith('test') && !botInfo.ownerId.includes(interaction.user.id)) return interaction.reply({ content: 'Only developers are able to run unit tests.',  ephemeral: true })

		if (command.permissions) {
			if (interaction.member.permissions.has(command.permissions)) {
				return interaction.reply(`You need \`${command.permissions}\` for this command`);
			}
		}

		if (command.DEVS && !botInfo.ownerId.includes(interaction.user.id)) return interaction.reply({ content: 'no.', ephemeral: true });

		const blacklisted = await blacklistSchema.findOne({ user: interaction.user.id });
		if (blacklisted && !botInfo.ownerId.includes(interaction.user.id)) return interaction.reply({ content: 'You are currently refrained from using any functions of the client, please join our [**Support Server**](https://discord.gg/WDTcBRNVPB) to appeal it.', ephemeral: true });

		try {
			await command.execute(interaction, data);
		}
		catch (error) {
			console.error(error);
			return interaction.reply({ content: 'Something went wrong while executing this command!', ephemeral: true });
		}

		// const webhook = new WebhookClient({ url: process.env.INTERACTION_GUILD_LOG_WEBHOOK });

		// const embed = new EmbedBuilder()
		// 	.setTitle('Interaction Create')
		// 	.addFields(
		// 		{ name: 'Command', value: interaction.commandName, inline: true },
		// 		{ name: 'Guild', value: `${interaction.guild.name} **\`(${interaction.guild.id})\`**`, inline: true },
		// 		{ name: 'Channel', value: `${interaction.channel.name} **\`(${interaction.channel.id})\`**`, inline: true },
		// 		{ name: 'User', value: `${interaction.user.tag} **\`(${interaction.user.id})\`**`, inline: true },
		// 	)
		// 	.setTimestamp();

		// webhook.send({ embeds: [embed] });
	},
};