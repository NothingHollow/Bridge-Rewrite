const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits, ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const guildSchema = require('../models/Guild.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('configurate')
		.setDescription('Display and modify current settings for your guild.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false),
	DEVS: true,
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		const guildData = await interaction.client.database.fetchGuild(interaction.guild.id);

		let configurations = {
			reception: guildData.settings.reception,
			transmission: guildData.settings.transmission,
			displayInvite: guildData.settings.displayInvite,
		};

		const receptionButton = interaction.client.button.buttonBuilder('receptionButton', 'Reception', interaction.client.button.booleanStyleBuilder(configurations.reception), null),
			transmissionButton = interaction.client.button.buttonBuilder('transmissionButton', 'Transmission', interaction.client.button.booleanStyleBuilder(configurations.transmission), null),
			displayInviteButton = interaction.client.button.buttonBuilder('displayInviteButton', 'Display Invite', interaction.client.button.booleanStyleBuilder(configurations.displayInvite), null),
			newInviteButton = interaction.client.button.buttonBuilder('newInviteButton', 'New Invitation Link', 'primary', null),
			newWebhookButton = interaction.client.button.buttonBuilder('newWebhookButton', 'New Webhook', 'primary', null),
			modifyChannelButton = interaction.client.button.buttonBuilder('modifyChannelButton', 'Modify Channel', 'primary', null),
			testWebhookButton = interaction.client.button.buttonBuilder('testWebhookButton', 'Test Webhook', 'primary', null);

		const embed = new EmbedBuilder()
			.setTitle(`Configuration Settings for ${interaction.guild.name}`)
			.addFields(
				{ name: 'Reception', value: `**\`${JSON.stringify(configurations.reception)}\`**`, inline: true },
				{ name: 'Transmission', value: `**\`${JSON.stringify(configurations.transmission)}\`*`, inline: true },
				{ name: 'Display Invite', value: `**\`${JSON.stringify(configurations.displayInvite)}\`*`, inline: true },
			)
			.setFooter({ text: 'Powered by Void Developments' })
			.setColor('#5865F2');

		const row = new ActionRowBuilder();
		const row2 = new ActionRowBuilder()
			.addComponents(newInviteButton, newWebhookButton, modifyChannelButton, testWebhookButton)

		if (guildData.premium === true) {
			row.addComponents(receptionButton, transmissionButton, displayInviteButton);

			await interaction.editReply({ embeds: [embed], components: [row, row2], ephemeral: true });
		}
		else {
			row.addComponents(receptionButton, transmissionButton.setDisabled(), displayInviteButton.setDisabled());

			await interaction.editReply({ embeds: [embed], components: [row, row2], ephemeral: true });
		}

		const filter = i => {
			i.deferUpdate();
			return i.user.id === interaction.user.id;
		};

		const currentChannel = interaction.client.channels.cache.get(guildData.channel);
		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

		collector.on('collect', async i => {
			collector.resetTimer();
			switch (i.customId) {
				case 'receptionButton': {
					await interaction.followUp({ embeds: [interaction.client.embed.successEmbed(`**\`Reception\`** configuration has been changed to **\`${await update(i.customId)}\`**`)], ephemeral: true });
					break;
				}
				case 'transmissionButton': {
					await interaction.followUp({ embeds: [interaction.client.embed.successEmbed(`**\`Transmission\`** configuration has been changed to **\`${await update(i.customId)}\`**`)], ephemeral: true });
					break;
				}
				case 'displayInviteButton': {
					await interaction.followUp({ embeds: [interaction.client.embed.successEmbed(`**\`Display Invite\`** configuration has been changed to **\`${await update(i.customId)}\`**`)], ephemeral: true });
					break;
				}
				case 'newInviteButton': {
					const newInvite = await currentChannel.createInvite({ maxAge: 0, maxUses: 0 })
						.catch(async () => { return await interaction.followUp({ embeds: [interaction.client.embed.permsEmbed('CREATE_INSTANT_INVITE')], ephemeral: true }); });
						console.log(newLink)
					const newLink = newInvite.url();
					await guildData.updateOne({ invite: newLink });

					await interaction.followUp({ embeds: [interaction.client.embed.successEmbed(`**\`Invitation Link\`** has been set to **\`${newLink}\`**`)], ephemeral: true })
					break;
				}
				case 'newWebhookButton': {
					const webhook = await currentChannel.createWebhook({
						name: 'Bridge',
						avatar: interaction.client.user.avatarURL(),
					}).catch(async () => { return await interaction.followUp({ embeds: [interaction.client.embed.permsEmbed('MANAGE_WEBHOOK')], ephemeral: true }); });

					guildData.webhook = webhook.url();
					await guildData.save();

					await interaction.followUp({ embeds: [interaction.client.embed.successEmbed(`**\`Webhook\`** has been set to **\`${webhook.url()}\`**`)], ephemeral: true });
					break;
				}
				case 'modifyChannelButton': {
					const modal = new ModalBuilder()
						.setCustomId('configurateModal')
						.setTitle(`Configurate Receiption Channel`);

					const input = new TextInputBuilder()
						.setCustomId('channelInput')
						.setLabel('Channel ID to receive transmissions in.')
						.setPlaceholder(`#${currentChannel.name || 'N/A'} | (${guildData.channel})`)
						.setMinLength(1)
						.setStyle(TextInputStyle.Short)
						.setRequired(true);

					const firstActionRow = new ActionRowBuilder().addComponents(input);
					modal.addComponents(firstActionRow);

					await i.showModal(modal);
					break;
				}
				case 'testWebhookButton': {
					const webhook = new WebhookClient({ url: guildData.webhook });
					webhook.send({ embeds: [interaction.client.embed.successEmbed(`Status Code: **\`200\`**.`)], allowedMentions: { users: [], roles: [] } })
						.catch(async () => { return await interaction.followUp({ embeds: [interaction.client.embed.errorEmbed(`Status Code: **\`404\`**\n\nThis indicated that the client is unable to establish a stable connection to the webhook. Please renew the webhook.`)], ephemeral: true }); });
					break;
				}
			}
		});

		collector.on('end', () => {
			interaction.editReply({ content: 'Promot expired' });
			receptionButton.setDisabled(true);
			transmissionButton.setDisabled(true);
			displayInviteButton.setDisabled(true);
			row.components = [receptionButton, transmissionButton, displayInviteButton];
		});

		async function update(id) {
			const setting = id.toLowerCase().replace('button', '');
			configurations[setting] = !configurations[setting];
			guildData.settings[setting] = !configurations[setting];
			await guildData.save();

			
			return configurations[setting];
		}
	},
};