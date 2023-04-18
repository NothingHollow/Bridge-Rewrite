const config = require('../config.js');
const botInfo = require('../config.json');
const request = require('request');
const { ActionRowBuilder, EmbedBuilder, WebhookClient } = require('discord.js');

module.exports = {
	name: 'messageCreate',
	on: false,
	async execute(message) {
		if (message.author.id === message.client.user.id || message.author.bot || message.webhookId) return;

		const guilds = await message.client.database.fetchGuilds();
		const guildData = await message.client.database.fetchGuild(message.guild.id);
		if (!guildData) return;
		if ((message.channel.id !== guildData.channel) || (guildData.subscription === 0)) return;

		const deleteAndError = function (err) {
			message.delete()
			return message.author.send({ embeds: [message.client.embed.errorEmbed(err)] }).catch(err => { return; });
		};

		// checkers & filters
		if (message.content.toString().length >= 2000) return deleteAndError('Message length cannot exceed **`2000`** characters.');
		if (message.content.toString().length <= 25) return deleteAndError('Message length must include more than **`25`** characters.');

		request(`https://www.purgomalum.com/service/containsprofanity?text=${message.content.toString()}`, (err, res, body) => {
			if (body === 'true') return deleteAndError('Message must not contain profanity.');
		});

		const redis = await message.client.redis.getRedisClient();
		if (!botInfo.botInfo.ownerId.includes(message.author.id)) {
			if (await redis.exists(`user:${message.author.id}`)) {
				const expirationTime = parseInt(await redis.get(`user:${message.author.id}`)) + config.postCooldown;

				return deleteAndError(`You are currently still on cooldown. You may advertise again <t:${Math.round((expirationTime) / 1000)}:R>`);
			};
		};

		// set data & cooldown
		const userData = await message.client.database.fetchUser(message.author.id);
		const now = Date.now();

		const cooldown = config.postCooldown - userData.subscription.tier * 5000;
		await userData.updateOne({ $inc: { adsPosted: +1 } });
		await redis.set(`user:${message.author.id}`, now, 'PX', cooldown);

		//transmit & sticky message & delete original message
		await message.client.transmit(message)
		await message.client.stickyMessage(message);
		await message.delete();

		//dm user
		if (userData.settings.notifications === true) {
			const disableNotifsButton = message.client.button.buttonBuilder('disable_notifications', 'Disable Notifications', '4', null),
				addMeButton = message.client.button.buttonBuilder(null, 'Add Me!', 'link', 'https://discord.com/api/oauth2/authorize?client_id=1072798665749561365&permissions=535263837905&scope=bot%20applications.commands'),
				supportServerButton = message.client.button.buttonBuilder(null, 'Support Server', 'link', 'https://discord.gg/WDTcBRNVPB');

			const row = new ActionRowBuilder()
				.addComponents(addMeButton, supportServerButton);

			const row2 = new ActionRowBuilder()
				.addComponents(disableNotifsButton);

			const notificationsEmbed = new EmbedBuilder()
				.setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() })
				.setDescription(`Thank-you for advertising in <#${message.channel.id}>. Your advertisement has been sent to **${message.client.statistic.totalGuilds(message.client)} guilds** and **${message.client.statistic.memberData(message.client).members} members**\n\nYou have overall posted **${userData.adsPosted + 1}** advertisements.\n\nBy advertising in any Bridge connected channel, you agree and acknowledge our [**Terms of Service**](${config.links.termsOfService}) and [**Privacy Policy**](${config.links.privacyPolicy}).\n\nEstimated Transmit Completion: <t:${Math.round((Date.now() / 1000) + (guilds.length * 5))}:R>`);

			message.author.send({ embeds: [notificationsEmbed], components: [row, row2] }).catch(() => { return; });

			//log
			const systemWebhook = new WebhookClient({ url: process.env.ADVERTISE_LOG_WEBHOOK });
			systemWebhook.send({ content: `**${message.author.tag}** (<@${message.author.id}>) posted an advertisement in **${message.guild.name}** and has overall posted **${userData.adsPosted + 1}** advertisements. They can post new advertisements after <t:${Math.round(Date.now() / 1000 + cooldown)}:F>`, allowedMentions: { users: [], roles: [] }, });
		};
	},
};