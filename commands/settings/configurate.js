const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits, ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, WebhookClient } = require('discord.js');
const guildSchema = require('../../models/Guild.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('configurate')
		.setDescription('Display and modify current settings for your guild.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false),
	DEVS: true,
	cooldown: 10,
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

			let message;
		if (guildData.premium === true) {
			row.addComponents(receptionButton, transmissionButton, displayInviteButton);
			 message = await interaction.editReply({ embeds: [embed], components: [row, row2], ephemeral: true, fetchReply: true });

		}
		else {
			row.addComponents(receptionButton, transmissionButton.setDisabled(), displayInviteButton.setDisabled());
			 message = await interaction.editReply({ embeds: [embed], components: [row, row2], ephemeral: true, fetchReply: true });

		}

		const filter = async i => {
			// await i.deferUpdate()
			return i.user.id === interaction.user.id;
		};

		const currentChannel = interaction.client.channels.cache.get(guildData.channel);
		const collector = await message.createMessageComponentCollector({ filter, time: 60000 });

		collector.on('collect', async i => {
			if (i.customId !== 'modifyChannelButton') await i.deferUpdate();
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

					guildData.invite = newInvite.url
					await guildData.save()

					await interaction.followUp({ embeds: [interaction.client.embed.successEmbed(`**\`Invitation Link\`** has been set to **\`${newInvite.url}\`**`)], ephemeral: true })
					break;
				}
				case 'newWebhookButton': {
					// new WebhookClient({ url: guildData.webhook })
					// .then(webhook => webhook.delete({ reason: 'Server webhook changed!' }))
					// .catch();
					const oldWebhook = new WebhookClient({ url: guildData.webhook });
					oldWebhook.delete()
						.catch(async () =>  {} );
					const webhook = await currentChannel.createWebhook({
						name: 'Bridge',
						avatar: interaction.client.user.avatarURL(),
					}).catch(async () => { return await interaction.followUp({ embeds: [interaction.client.embed.permsEmbed('MANAGE_WEBHOOK')], ephemeral: true }); });

					guildData.webhook = webhook.url
					await guildData.save();

					await interaction.followUp({ embeds: [interaction.client.embed.successEmbed(`**\`Webhook\`** has been set to **\`${webhook.url}\`**`)], ephemeral: true });
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
						.setMinLength(15)
						.setMaxLength(20)
						.setStyle(TextInputStyle.Short)
						.setRequired(true);

					const firstActionRow = new ActionRowBuilder().addComponents(input);
					modal.addComponents(firstActionRow);

					await i.showModal(modal);

					const modalFilter = async i => {
						// i.customId === 'configurateModal';
						return i.user.id === interaction.user.id;
					};

					i.awaitModalSubmit({ modalFilter, time:60000 })
					.then(async modalInteraction => {
					const id = modalInteraction.fields.getTextInputValue('channelInput');
					if (isNumeric(id)) {
						const channel = modalInteraction.guild.channels.cache.get(id);
						if (!channel) return modalInteraction.reply('Cannot get that channel in this guild!');

						guildData.channel = id;
						await guildData.save();

						modalInteraction.reply({content: 'Changed!', ephemeral: true})
					}
					else {
						modalInteraction.reply({content: 'Please make sure that the id you mentioned is a channel id', ephemeral: true})
					}
					})
					break;
				}
				case 'testWebhookButton': {
					const webhook = new WebhookClient({ url: guildData.webhook });
					webhook.send({ embeds: [interaction.client.embed.successEmbed(`Status Code: **\`200\`**.`)], allowedMentions: { users: [], roles: [] } })
						.catch(async () => { return await interaction.followUp({ embeds: [interaction.client.embed.errorEmbed(`Status Code: **\`404\`**\n\nThis indicated that the client is unable to establish a stable connection to the webhook. Please renew the webhook.`)], ephemeral: true }); });
					break;
				}
				// case 'configurateModal': {
				// 	console.log('yes')
				// 	const id = interaction.fields.getTextInputValue('channelInput');
				// 	if (isNumeric(id)) {
				// 		const channel = interaction.guild.channels.cache.get(id);
				// 		if (!channel) return interaction.reply('Cannot get that channel in this guild!');

				// 		guildData.channel = id;
				// 		await guildData.save();
				// 	}
				// 	else {
				// 		interaction.reply('Please make sure that the id you mentioned is a channel id')
				// 	}
				// }
			}
		});

		collector.on('end', () => {
			receptionButton.setDisabled(true);
			transmissionButton.setDisabled(true);
			displayInviteButton.setDisabled(true);
			newInviteButton.setDisabled(true);
			newWebhookButton.setDisabled(true);
			modifyChannelButton.setDisabled(true);
			testWebhookButton.setDisabled(true);
			row.components = [receptionButton, transmissionButton, displayInviteButton];
			row2.components = [newInviteButton, newWebhookButton, modifyChannelButton, testWebhookButton]
			interaction.editReply({ content: 'Promot expired', components: [row, row2]});
		});

		async function update(id) {
			const setting = id.toLowerCase().replace('button', '');
			configurations[setting] = !configurations[setting];
			guildData.settings[setting] = configurations[setting];
			await guildData.save();


			const updatedEmbed = new EmbedBuilder()
			.setTitle(`Configuration Settings for ${interaction.guild.name}`)
			.addFields(
				{ name: 'Reception', value: `**\`${JSON.stringify(configurations.reception)}\`**`, inline: true },
				{ name: 'Transmission', value: `**\`${JSON.stringify(configurations.transmission)}\`*`, inline: true },
				{ name: 'Display Invite', value: `**\`${JSON.stringify(configurations.displayInvite)}\`*`, inline: true },
			)
			.setFooter({ text: 'Powered by Void Developments' })
			.setColor('#5865F2');

			const updatedReceptionButton = interaction.client.button.buttonBuilder('receptionButton', 'Reception', interaction.client.button.booleanStyleBuilder(configurations.reception), null),
			updatedTransmissionButton = interaction.client.button.buttonBuilder('transmissionButton', 'Transmission', interaction.client.button.booleanStyleBuilder(configurations.transmission), null),
			updatedDisplayInviteButton = interaction.client.button.buttonBuilder('displayInviteButton', 'Display Invite', interaction.client.button.booleanStyleBuilder(configurations.displayInvite), null);

			if (guildData.premium === true) {
				row.components= [updatedReceptionButton, updatedTransmissionButton, updatedDisplayInviteButton];
			}
			else {
				row.components = [updatedReceptionButton, updatedTransmissionButton.setDisabled(), updatedDisplayInviteButton.setDisabled()];
			}

			await interaction.editReply({ embeds: [updatedEmbed], components: [row, row2], ephemeral: true, fetchReply: true });
			return configurations[setting];
		}
	},
};

function isNumeric(str) {
	return /^\d+$/.test(str);
  }