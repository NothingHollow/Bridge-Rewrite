const { WebhookClient, ActionRowBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRow, Events } = require('discord.js');
const blacklistSchema = require('../models/Blacklist');
const guildSchema = require('../models/Guild');

module.exports = {
	name: Events.InteractionCreate,
	on: true,
	async execute(interaction) {
		if (!interaction.isButton()) return;

		switch (interaction.customId.split(' ').shift()) {
			case 'report_button': {
				const guildID = interaction.customId.split(' ')[1];
				const messageID = interaction.customId.split(' ')[2];
				const authorID = interaction.customId.split(' ')[3];

				const guildData = await interaction.client.database.fetchGuild(guildID);
				const blacklistData = await blacklistSchema.findOne({ user: authorID });
				if (blacklistData) {
					const webhook = new WebhookClient({ url: guildData.webhook });
					await webhook.deleteMessage(messageID);

					return interaction.reply({ embeds: [interaction.client.embed.replyEmbed('💥 You suddenly heard a large explosion. The advertisement is gone?!')], ephemeral: true });
				};

				const author = interaction.client.users.cache.get(authorID);
				const trimmedAuthor = JSON.parse(JSON.stringify(author.tag).substring(0, 23));
				let authorTag = trimmedAuthor;
				if (trimmedAuthor.length > 23) {
					authorTag = trimmedAuthor + '...';
				};

				const modal = new ModalBuilder()
					.setCustomId(`report_modal ${guildID} ${messageID} ${authorID}`)
					.setTitle(`Report ${author.tag}`);

				const reasonInput = new TextInputBuilder()
					.setCustomId('reasonInput')
					.setLabel(`What rule did ${authorTag} violate?`)
					.setStyle(TextInputStyle.Short)
					.setRequired(true);

				const row = new ActionRowBuilder()
					.addComponents(reasonInput);

				modal.addComponents(row);

				await interaction.showModal(modal);
				break;
			}
			case 'disable_notifications': {
				const userData = await interaction.client.database.fetchUser(interaction.user.id);

				userData.settings.notifications = false;
				await userData.save();

				const enableNotifsButton = interaction.client.button.buttonBuilder('enable_notifications', 'Enable Notifications', 'success', null);

				const row = new ActionRowBuilder()
					.addComponents(enableNotifsButton);

				interaction.user.send({ embeds: [interaction.client.embed.successEmbed('Notifications has been disabled.')], components: [row] });
				break;
			}
			case 'enable_notifications': {
				const userData = await interaction.client.database.fetchUser(interaction.user.id);

				userData.settings.notifications = false;
				await userData.save();

				const disableNotifsButton = interaction.client.button.buttonBuilder('disable_notifications', 'Disable Notifications', 'danger', null);

				const row = new ActionRowBuilder()
					.addComponents(disableNotifsButton);

				interaction.user.send({ embeds: [interaction.client.embed.successEmbed('Notifications has been enabled.')], components: [row] });
				break;
			}

		};
	},
};
