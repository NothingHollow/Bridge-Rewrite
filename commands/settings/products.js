const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const subscriptions = require('../../assets/subscriptions.json');
const { guild } = require('../../config');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('products')
		.setDescription('View our products.'),
	DEVS: true,
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		const userData = await interaction.client.database.fetchUser(interaction.user.id);
		const guildData = await interaction.client.database.fetchGuild(interaction.guild.id);

		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId('menu')
			.setPlaceholder('Select a Subscription Plan!')
			.addOptions(
				{
					label: 'User Subscriptions',
					value: 'user',
				},
				{
					label: 'Guild Subscriptions',
					value: 'guild',
				},
				{
					label: 'Sponsorships',
					value: 'sponsorships',
				},
			);

		const row = new ActionRowBuilder()
			.addComponents(selectMenu);
			
		const embed = new EmbedBuilder()
			.setTitle('Products')
			.setDescription('Help support Bridge by purchasing our products. By purchasing our products, you are __supporting the development of Bridge__. Besides, you also get some __**epic perks**__!')
			.addFields(
				{ name: 'Current User Subscription', value: `**\`${Object.keys(subscriptions.user)[userData.subscription.tier].toString().toUpperCase()}\`**` || 'N/A', inline: true },
				{ name: 'Current Guild Subscription', value: `**\`${Object.keys(subscriptions.guild)[guildData.subscription].toString().toUpperCase()}\`**` || 'N/A', inline: true }
			)
			.setFooter({ text: 'Powered by Void Developments' })
			.setColor('#5865F2');

		await interaction.editReply({ embeds: [embed], components: [row], ephemeral: true });

		const filter = i => {
			if (!i.isStringSelectMenu()) return;
			i.deferUpdate();
			return i.user.id === interaction.user.id;
		};

		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

		collector.on('collect', async i => {
			collector.resetTimer();
			switch (i.values[0]) {
				case 'user': {
					const products = new EmbedBuilder()
						.setTitle('Products | User')
						.addFields(
							{ name: 'Basic', value: '> Transmission ability\n> 60 minutes cooldown' },
							{ name: 'Deluxe', value: '> Transmission ability\n> Priority support\n> -5 minutes for cooldown (does not stack)' },
							{ name: 'Max', value: '> Transmission ability\n> Priority support\n> Custom embed color\n> Custom rank\n> -10 minutes for cooldown (does not stack)' },
						)
						.setFooter({ text: 'Powered by Void Developments' })
						.setColor('#5865F2');

					const promotion = new EmbedBuilder()
						.setAuthor({ name: 'Ongoing Promotion', iconURL: 'https://cdn.discordapp.com/emojis/1096890042040975543.webp?size=96&quality=lossless' })
						.setDescription('Obtain **User Deluxe** by joining [**Bridge\'s Support Server**](https://discord.gg/WDTcBRNVPB).')
						.setFooter({ text: 'Powered by Void Developments' })
						.setColor('#5865F2');

					await interaction.editReply({ content: 'Currently viewing information with tag: **`[ User Subscriptions ]`**', embeds: [embed, products, promotion], components: [row], ephemeral: true });
					break;
				};
				case 'guild': {
					const products = new EmbedBuilder()
						.setTitle('Products | Guild')
						.addFields(
							{ name: 'Basic', value: '> Reception ability' },
							{ name: 'Premium', value: '> Enables transmission' }
						)
						.setFooter({ text: 'Powered by Void Developments' })
						.setColor('#5865F2');

					const promotion = new EmbedBuilder()
						.setAuthor({ name: 'Ongoing Promotion', iconURL: 'https://cdn.discordapp.com/emojis/1096890042040975543.webp?size=96&quality=lossless' })
						.setDescription('Obtain **Guild Premium** by running </apply:1096153378087772232>.')
						.setFooter({ text: 'Powered by Void Developments' })
						.setColor('#5865F2');

					await interaction.editReply({ content: 'Currently viewing information with tag: **`[ Guild Subscriptions ]`**', embeds: [embed, products, promotion], components: [row], ephemeral: true });
					break;
				};
				case 'sponsorships': {
					const products = new EmbedBuilder()
						.setTitle('Bridge | Sponsorships')
						.addFields(
							{ name: 'To be added...', value: 'N/A' }
						)
						.setFooter({ text: 'Powered by Void Developments' })
						.setColor('#5865F2');

					await interaction.editReply({ content: 'Currently viewing information with tag: **`[ Sponsorships ]`**', embeds: [embed, products], components: [row], ephemeral: true });
					break;
				};
			};
		});

		collector.on('end', () => {
			selectMenu.setDisabled(true);
			row.components = [selectMenu];
			interaction.editReply({ content: '', embeds: [interaction.client.embed.expiredEmbed('This menu has expired.')], components: [row], ephemeral: true });
		});
	},
};