const { EmbedBuilder, WebhookClient, Events } = require('discord.js');
const guildSchema = require('../models/Guild');
const config = require('../config.js');

module.exports = {
    name: Events.InteractionCreate,
    on: true,
    async execute(interaction) {
        if (!interaction.isModalSubmit()) return;

        switch (interaction.customId.split(' ').shift()) {
            case 'report_modal': {
                const guildID = interaction.customId.split(' ')[1];
                const messageID = interaction.customId.split(' ')[2];
                const authorID = interaction.customId.split(' ')[3];

                const guildData = await interaction.client.database.fetchGuild(guildID);
                const webhook = new WebhookClient({ url: guildData.webhook });

                const message = await webhook.fetchMessage(messageID);

                const reportEmbed = new EmbedBuilder()
                    .addFields({ name: 'Reporter', value: `${interaction.user.tag} **\`(${interaction.user.id})\`** (<@${interaction.user.id}>)`, inline: true })
                    .addFields({ name: 'Author', value: `<@${authorID}> **\`(${authorID})\`**`, inline: true })
                    .addFields({ name: 'Guild', value: `${interaction.guild.name} **\`(${interaction.guild.id})\`**`, inline: true })
                    .addFields({ name: 'Content', value: message.content })
                    .setTimestamp();

                const reportsChannel = interaction.client.channels.cache.get(config.channels.reports);
                const msg = await reportsChannel.send({ content: guildData.invite, embeds: [reportEmbed] });
                msg.reply({ content: authorID });

                interaction.reply({ embeds: [interaction.client.embed.replyEmbed('Your report has been delivered to our **Moderation Team** for review.\n\nThanks for reporting the user to us!')], ephemeral: true });
            }
        }
    },
};
