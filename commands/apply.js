const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../config.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('apply')
		.setDescription('Apply for guild premium.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false),
	async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

		const guildOwner = await interaction.guild.fetchOwner();

		const guildData = await interaction.client.database.fetchGuild(interaction.guild.id);
		if (!guildData) return await interaction.editReply({ embeds: [interaction.client.embed.errorEmbed('Please run </setup:1096153378087772232> before applying for premium.')], ephemeral: true });
		if (guildData.subscription === 1) return await interaction.editReply({ embeds: [interaction.client.embed.errorEmbed(`Premium is already enabled for **\`${interaction.guild.name}\`**`)], ephemeral: true });

		const applicationEmbed = new EmbedBuilder()
			.setTitle('Premium Application')
			.addFields(
				{ name: 'Guild', value: `${interaction.guild.name} (${interaction.guild.id})`, inline: true },
				{ name: 'Owner', value: ` ${guildOwner.user.tag} (<@${guildOwner.id}>) **\`(${guildOwner.id})\`**`, inline: true },
				{ name: 'Applier', value: `${interaction.user.tag} (<@${interaction.user.id}>) **\`(${interaction.user.id})\`**` },
				{ name: 'Channel', value: `<#${guildData.channel}> (${guildData.channel})`, inline: true },
			);

		const applicationsChannel = interaction.client.channels.cache.get(config.channels.applications);
		const message = await applicationsChannel.send({ content: guildData.invite, embeds: [applicationEmbed] });
		await message.reply({ content: interaction.guild.id, ephemeral: true });

		const applicationPendingEmbed = new EmbedBuilder()
			.setTitle('Premium Pending')
			.setDescription(`<:shine:1075442111064838225> Wonderful! Your application for premium is currently pending to be reviewed by our administration team.\n\n<:shine:1075442111064838225> A special message will be sent in <#${guildData.channel}> if premium is activiated. Besides that, the owner will also receive a direct message related to the application once it has been reviewed.`)
			.setColor('#5ae7dd');

		await interaction.editReply({ embeds: [applicationPendingEmbed], ephemeral: true });
	},
};