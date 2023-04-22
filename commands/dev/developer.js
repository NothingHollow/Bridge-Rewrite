const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('developer')
		.setDescription('Developer panel.')

		.addSubcommand(subcommand =>
			subcommand
				.setName('announce')
				.setDescription('It does what it says.')

				.addStringOption(option => option.setName('announcement_message_id')
					.setDescription('Announcement message ID to fetch the message content.')
					.setRequired(true))),
	DEVS: true,
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		switch (interaction.options.getSubcommand()) {
			case 'announce': {
				const messageID = interaction.options.getString('announcement_message_id');
				const announcementChannel = interaction.client.channels.cache.get('1076081835735519283');

				const announcementMessage = await announcementChannel.messages.fetch(messageID);
				if (!announcementMessage) return interaction.editReply({ embeds: [interaction.client.embed.errorEmbed('The announcement cannot be fetched.')], ephemeral: true });
				const announcementContent = announcementMessage.content;

				const announcementButton = interaction.client.button.buttonBuilder(null, 'Announcement', 'link', `https://discord.com/channels/1039545644286759013/1076081835735519283/${messageID}`);

				const row = new ActionRowBuilder()
					.addComponents(announcementButton);

				const guilds = await interaction.client.database.fetchGuilds();
				guilds.forEach(async guild => {
					const webhook = new WebhookClient({ url: guild.webhook });

					webhook.send({
						content: announcementContent,
						components: [row],
						allowedMentions: { users: [], roles: [] },
						username: interaction.user.username,
						avatarURL: interaction.user.avatarURL(),
					})
				});

				await interaction.editReply({ embeds: [interaction.client.embed.successEmbed('Announced to all servers with Bridge connected.')], ephemeral: true });
				break;
			}
		}
	},
};