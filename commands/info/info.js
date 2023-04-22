const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder, version } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Information of the bot.'),
	DEVS: true,
	async execute(interaction) {

        const botEmbed = new EmbedBuilder()
        .setTitle('Bot Information')
        .addFields({name: 'Library', value: 'discord.js', inline: true}, {name: 'Version',value: version, inline: true});

		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId('select')
			.setPlaceholder('Nothing is currently selected.')
			.addOptions(
				{
					label: 'Bot',
					value: 'bot'
				},
				{
					label: 'Frequently Asked Questions',
					value: 'faq',
				},
				{
					label: 'Staff',
					value: 'staff',
				},
			);

		const row = new ActionRowBuilder()
			.addComponents(selectMenu);

		interaction.reply({ embeds: [botEmbed], components: [row], ephemeral: true });

		const filter = i => {
			if (!i.isStringSelectMenu()) return;
			i.deferUpdate();
			return i.user.id === interaction.user.id;
		};

		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

		collector.on('collect', async i => {
			collector.resetTimer();
			switch (i.values[0]) {
				case 'bot': {
					interaction.editReply({ content: 'Currently viewing information with tag: **`[ Bot ]`**', embeds: [botEmbed], components: [row], ephemeral: true });
					break;
				}
			case 'faq': {
				const embed = new EmbedBuilder()
					.setTitle('Frequently Asked Questions')
					.addFields(
						{ name: 'What is Bridge?', value: 'Bridge is a project developed by 2 developers. We aim to provide a simple way for advertisers to  __**advertise**__ their project, and for users to __**discover**__ countless projects.' },
						{ name: 'Do I need to pay to use Bridge\'s services?', value: 'Bridge is completely free of charge. But, donations are deeply appreciated. Our developers spent precious time in coding and making <@1072798665749561365> as perfect as possible and to provide the best user experience ever.' },
						{ name: 'Can I make a bot similar to Bridge?', value: 'Yes, we do not limit anyone from creating an application similar to <@1072798665749561365>, we allow everyone to copy our idea. But, please respect our frontend development team and to limit copying and or heavily inspiring off of our designs.' },
						{ name: 'Is Bridge open sourced?', value: 'No, <@1072798665749561365> will never be open source. If you wish to create a bot like <@1072798665749561365>, you may attempt to do it yourself. The concept behind it is fairly simple and can be easily copied. If you need assistance you may contact <@904631191301394463>.' },
						{ name: 'I want to know more about Bridge, how can I do so?', value: 'If you wish to know more about <@1072798665749561365>, please run `/info`. If it isn\'t stated there, please contact <@904631191301394463>.' },
						{ name: 'I found a bug, where can I report it?', value: 'If you found a bug, please report it to <@904631191301394463>, we appreciate every bug report since it improves the user\'s experience.' },
						{ name: 'What is the standardized cooldown for Bridge?', value: 'The standardized cooldown is `1 hour`. But this may be subjected to change. If we do change the cooldown, we will announce it in <#1076081835735519283> so please keep an eye out for announcements.' },
						{ name: 'How can I report someone?', value: 'When an advertisement is sent to other servers or sent locally, a `Report` button, styled Red is attached to that message. If you think the advertisement is rule breaking, you may click the Report button and fill in our report form. After doing so, our Moderation Team will inspect it.' },
						{ name: 'How can I setup Bridge?', value: 'You may run `/setup`.' },
						{ name: 'What is Bridge Premium and how can I upgrade my server to it?', value: 'Premium means users can send advertisements from a server to another. Premium is completely __free of charge__ and can be accessible through applying. You may apply for premium by running `/apply`. The time needed to review an application should take no longer than 7 days.' },
						{ name: 'I got blacklisted from using Bridge, how can I appeal it?', value: 'You may appeal your blacklist by direct messaging <@904631191301394463>.' },
						{ name: 'I still got other questions.', value: 'Please direct message <@904631191301394463> and we will try our best to answer you.' },
						{ name: 'How do I add Bridge to my server?', value: 'https://discord.com/api/oauth2/authorize?client_id=1072798665749561365&permissions=535263837905&scope=bot%20applications.commands' },
					);

				interaction.editReply({ content: 'Currently viewing information with tag: **`[ Frequently Asked Questions ]`**', embeds: [embed], components: [row], ephemeral: true });
				break;
			}
			case 'staff': {
				const ctea = interaction.client.users.cache.get('904631191301394463') || await interaction.client.users.fetch('904631191301394463');
				const nothingness = interaction.client.users.cache.get('605061180599304212') || await interaction.client.users.fetch('605061180599304212');

				const embed = new EmbedBuilder()
					.setTitle('Staff')
					.addFields(
						{ name: 'Development', value: `__**Frontend:**__\n${ctea.tag} (<@${ctea.id}>)\n\n__**Backend:**__\n${nothingness.tag} (<@${nothingness.id}>)` },
					);

				interaction.editReply({ content: 'Currently viewing information with tag: **`[ STAFF ]`**', embeds: [embed], components: [row], ephemeral: true });
				break;
			}
			}
		});

		collector.on('end', () => {
			selectMenu.setDisabled(true);
			row.components = [selectMenu];
			interaction.editReply({ content: 'This promot has expired.', components: [row], ephemeral: true });
		});
	},
};