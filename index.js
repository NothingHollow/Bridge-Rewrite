const
	fs = require('node:fs'),
	path = require('node:path'),
	{ Client, Collection, GatewayIntentBits, ActivityType, WebhookClient } = require('discord.js'),
	chalk = require('chalk'),
	mongoose = require('mongoose'),
	config = require('./config.json'),
	connectDB = require('./utils/connectDB');

require('dotenv').config();

const client = new Client({
	presence: {
		status: config.activity.status,
		activities: [
			{ name: config.activity.name, type: ActivityType[config.activity.type] },
		],
	},
	intents: [GatewayIntentBits.AutoModerationConfiguration, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.Guilds, GatewayIntentBits.AutoModerationExecution, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildScheduledEvents, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.MessageContent],
	// partials: ['USER', 'CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION'],
	allowedMentions: {
		allowedMentions: { users: [], roles: [] },
		// repliedUser: true,
	},
});

client.commands = new Collection();
client.cooldowns = new Collection();
client.localDatabase = new Collection();
client.button = require('./utils/button');
client.database = require('./utils/database');
client.embed = require('./utils/embed');
client.redis = require('./utils/redis');
client.statistic = require('./utils/statistic');
client.stickyMessage = require('./utils/stickyMessage');
client.transmit = require('./utils/transmit');

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// // Restore Bot Data
// const helperFiles = fs.readdirSync('./helpers').filter(file => file.endsWith('.js'));

// for (const file of helperFiles) {
// 	const helper = require(`./helpers/${file}`);
// 	helper();
// }

function logErr(err) {
	const webhook = new WebhookClient({ url: process.env.ERROR_LOG_WEBHOOK });
	return webhook.send({ content: `<@&1090892433237233774>\n\`\`\`${err}\`\`\`` });
}

console.log(chalk.bold.hex('#FA8072')('Logging'), chalk.bold.hex('#FFA500')('in'), chalk.bold.hex('#FFFF00')('...'));
// require('./dashboard/app')(client);

process.on('SIGINT', () => {
	console.log(chalk.bold.magenta('Gracefully exiting..'));
	process.exit();
});

// process.on('unhandledRejection', async err => console.log(err.stack));
// process.on('uncaughtException', async err => console.log(err.stack));

// process.on('unhandledRejection', error => {
// 	console.error(chalk.red.bold('Unhandled Promise Rejection =>', error));
// 	logErr(error);
// // client.channels.cache.get("Your-Channel-ID").send(`\`\`\`${error}\`\`\``);
// });

// process.on('uncaughtException', error => {
// 	console.error(chalk.red.bold('Uncaught Exception =>', error));
// 	logErr(error);
// 	//  client.channels.cache.get("Your-Channel-ID").send(`\`\`\`${error}\`\`\``);
// });

process.on('exit', () => {
	console.log(chalk.yellow.bold('System Exiting... | Doing suicide now, Seeeppukkuu'));
	console.log(chalk.red.bold('Exited! I am now dead :) and I\'m happy!'));
	// client.channels.cache.get("Your-Channel-ID").send(`\`\`\`${error}\`\`\``);
});

// process.on('multipleResolves', error => {
//	console.error(chalk.red.bold('Multiple Resolves =>', error));
// client.channels.cache.get("Your-Channel-ID").send(`\`\`\`${error}\`\`\``);
// });

connectDB();

mongoose.connection.once('open', () => {
	console.log(chalk.bold.hex('#00ff55')('Connected'), chalk.bold.hex('#39ff14')('to'), chalk.bold.hex('#0bda51')('Mongo!'));
	client.login(process.env.TOKEN);
});