const { WebhookClient, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

const transmit = async function (message) {
    const guildData = await message.client.database.fetchGuild(message.guild.id);

    const sentInButton = async function () {
        try {
          return message.client.button.buttonBuilder(null, `${message.guild.name}`, 'link', guildData.invite);
        } catch (error) {
          console.log(error);
          const newInvite = await message.channel.createInvite({ maxAge: 0, maxUses: 0 });
          await guildData.updateOne({ webhook: newInvite.url() });
          return message.client.button.buttonBuilder(null, `${message.guild.name}`, 'link', newInvite.url());
        }
      };
 
    const guilds = await message.client.database.fetchGuilds();
    guilds.forEach(async (guild) => {
        wait(5000);
        let webhook = new WebhookClient({ url: guild.webhook });
        if (!webhook) {
            const channel = message.client.channels.cache.get(guild.channel);
            if (!channel) return;

            const newWebhook = await channel.createWebhook({
                name: message.client.user.username,
                avatar: message.client.avatarURL(),
            });

            await guild.updateOne({ webhook: newWebhook.url() });
            webhook = new WebhookClient({ url: newWebhook.url() });
        };

        const embed = new EmbedBuilder()
            .setTitle(message.client.user.username)
            .addFields({ name: 'Author', value: `${message.author.tag} | **\`(${message.author.id})\`**` })
            .setFooter({ text: 'Powered by Void Developments' })
            .setTimestamp()
            .setColor('#5865F2')

        const row = new ActionRowBuilder()
            .addComponents(await sentInButton());

        const msg = await webhook.send({
            content: message.content,
            embeds: [embed],
            components: [row],
            allowedMentions: { users: [], roles: [] },
            username: message.author.username,
            avatarURL: message.author.avatarURL(),
        });

        const reportButton = message.client.button.buttonBuilder(`report_button ${message.guild.id} ${msg.id} ${message.author.id}`, 'Report', 'danger', null);

        const row2 = new ActionRowBuilder()
            .addComponents(reportButton);

        await webhook.editMessage(msg.id, {
            components: [row2],
            allowedMentions: { users: [], roles: [] },
        });
    });
};

module.exports = transmit;