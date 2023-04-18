const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const guildSchema = require('../models/Guild');
const config = require('../config.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Setup your server to receive advertisements from other guilds.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false)

		.addChannelOption(option => option.setName('channel')
			.setDescription('Channel which receives the advertisements.')
			.setRequired(true)),
	DEVS: true,
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		const guildID = interaction.guild.id;
		const guildData = await interaction.client.database.fetchGuild(guildID);
		if (guildData) return await interaction.editReply({ embeds: [interaction.client.embed.errorEmbed('Your guild is already set up! You may reset it by running </reset:1096153378087772239>.')], ephemeral: true });

		const channel = interaction.options.getChannel('channel');
		channel.permissionOverwrites.edit(interaction.guild.id, { ViewChannel: true, SendMessages: false })
			.catch(async () => { await interaction.editReply({ embeds: [interaction.client.embed.permsEmbed('MANAGE_CHANNEL')], ephemeral: true }); });

		interaction.channel.setRateLimitPerUser(config.postCooldown).catch(() => { return; });

		const invite = await channel.createInvite({ maxAge: 0, maxUses: 0 })
			.catch(async () => { return await interaction.editReply({ embeds: [interaction.client.embed.permsEmbed('CREATE_INSTANT_INVITE')], ephemeral: true }); });

		const webhook = await channel.createWebhook({
			name: 'Bridge',
			avatar: interaction.client.user.avatarURL(),
		}).catch(async () => { return await interaction.editReply({ embeds: [interaction.client.embed.permsEmbed('MANAGE_WEBHOOK')], ephemeral: true }); });

		await new guildSchema({ guild: guildID, channel: channel.id, invite: invite, webhook: webhook.url }).save();
		await interaction.editReply({ embeds: [interaction.client.embed.successEmbed(`Users from **\`${interaction.guild.name}\`** may now __receieve advertisements from other servers__.\n\nBut, to send advertisements from here to other servers with Bridge installed, you must upgrade to premium. Premium is completely free and you may get it by running </apply:1>.`)], ephemeral: true });

		webhook.send({ embeds: [interaction.client.embed.successEmbed('Bridge is now connected to this channel.')] })
			.catch(async () => {
				await guildSchema.deleteOne({ guild: guildID })
				return await interaction.editReply({ embed: [interaction.client.embed.errorEmbed(`The webhook I just made in ${channel} seems to be deleted. Please make sure no external applications are deleting webhooks due to it being misevaluated as suspicious activity. You are advised to run /reset and /setup again since the data has been ejected from the database.`)], ephemeral: true });
			});
	},
};