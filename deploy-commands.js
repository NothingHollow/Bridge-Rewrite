const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const config = require('./config.json');
const dotenv = require('dotenv');
const chalk = require('chalk');
// const { Client } = require('discord.js');
// const client = new Client({ intents: 'GUILDS' });

dotenv.config();

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
	try {
		await rest.put(
			Routes.applicationCommands(config.botInfo.clientId),
			{ body: commands },
		);

		// if (!client.application?.owner) await client.application?.fetch();

		// const command = await client.guilds.cache.get(guildId)?.commands.fetch('900016585643794442');

		// const permissions = [
		// 	{
		// 		id: '605061180599304212',
		// 		type: 'USER',
		// 		permission: true,
		// 	},
		// ];

		// await command.permissions.set({ permissions });

		console.log(chalk.hex('#FA8072')('Successfully'), chalk.hex('#FFA500')('registered'), chalk.hex('#FFFF00')('application'), chalk.hex('#0bda51')('commands'), chalk.hex('#00FFFF')('...'));
	}
	catch (error) {
		console.error(error);
	}
})();