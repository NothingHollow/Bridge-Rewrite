const chalk = require('chalk');
const { Events } = require('discord.js')

module.exports = {
	name: Events.ClientReady,
	on: true,
	async execute(client) {
		function border() {
			console.log(chalk.hex('#808080')('------------------------------------------------------'));
		}

		console.log(chalk.bold.hex('#00FFFF')('Ready!'), chalk.bold.hex('#D1A1D6')('Logged'), chalk.bold.hex('#feb8c6')('in'), chalk.bold.hex('#e75480')('as'), chalk.bold.hex('#c0c0c0').bold.underline(client.user.tag));
		border();
		client.guilds.cache.forEach(guild => {
			console.log(chalk.bold.hex('#FA8072')(guild.name), '|', chalk.bold.hex('#FFA500')(guild.id));
		});
		border();

		console.log(`Loaded ${chalk.blueBright.bold(client.commands.size)} commands`);
		console.log(`Status : ${chalk.yellowBright.bold('Operational')}`);
		border();

		// developerTools.webhook(client, '1090886494585114634', 'Bridge', client.user.avatarURL());

		// const channel = client.channels.cache.get('1081601863339737140');
		// console.log(channel.name);
		// channel.setName('┋🛰・universal-ads')
	},
};
