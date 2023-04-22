const { botInfo } = require('../config.json');
const { WebhookClient, EmbedBuilder, Collection, Events } = require('discord.js');
const blacklistSchema = require('../models/Blacklist');

module.exports = {
	name: Events.InteractionCreate,
	on: true,
	async execute(interaction) {
		if (!interaction.isCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) return;

		const { cooldowns } = interaction.client;

	if (!cooldowns.has(command.data.name)) {
		cooldowns.set(command.data.name, new Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.data.name);
	const defaultCooldownDuration = 3;
	const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

	if (timestamps.has(interaction.user.id)) {
		const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

		if (now < expirationTime) {
			const expiredTimestamp = Math.round(expirationTime / 1000);
			return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
		}
	}

	timestamps.set(interaction.user.id, now);
	setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

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