const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('eval')
		.setDescription('Evaluates code.')
		.addStringOption(option => option.setName('code')
			.setDescription('Code Input')
			.setRequired(true)),
	DEVS: true,
	async execute(interaction) {
		function clean(text) {
			if (typeof (text) === 'string') { return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203)); }
			else { return text; }
		}

		const code = interaction.options.getString('code');

		try {
			let result = eval(code);

			if (typeof result !== 'string') { result = require('util').inspect(result); }

			if (result.includes(interaction.client.token)) {
				result = result.replace(interaction.client.token, ':D');
			}
			else if (result.includes(interaction.token)) {
				result = result.replace(interaction.token, ':D');
			}

			const embed = new EmbedBuilder()
				.setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
				.addFields({ name: 'Input', value: `\`\`\`js\n${code}\`\`\`` })
				.addFields({ name: 'Output', value: `\`\`\`js\n${clean(result)}\`\`\`` });

			interaction.reply({ embeds: [embed], ephemeral: true });

		}
		catch (err) {
			interaction.reply({ content: `\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``, ephemeral: true });
		}
	},
};