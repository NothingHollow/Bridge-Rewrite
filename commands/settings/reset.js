const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits, WebhookClient } = require('discord.js');
const guildSchema = require('../../models/Guild');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reset')
		.setDescription('Reset all data for your guild.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false),
	DEVS: true,
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

        const guildData = await interaction.client.database.fetchGuild(interaction.guild.id);
        if (!guildData) return await interaction.editReply({ embeds: [interaction.client.embed.errorEmbed('Your guild cannot be located in the database. Setup your guild by running </setup:1096153378087772232>')], ephemeral: true });
	
        await interaction.editReply({ embeds: [interaction.client.embed.successEmbed(`Data for **\`${interaction.guild.name}\`** has been reset.`)], ephemeral: true });
        new WebhookClient({ url: guildData.webhook }).delete();
		await guildSchema.deleteOne({ guild: interaction.guild.id });
    },
};