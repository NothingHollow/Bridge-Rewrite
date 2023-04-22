const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const userSchema = require('../../models/User');
const blacklistSchema = require('../../models/Blacklist');
const offenceStringList = require('../../assets/offences.json');
const { v4: uuid } = require('uuid');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('Add / remove / check a blacklist.')

        .addSubcommand(subcommand =>
            subcommand.setName('add')
                .setDescription('Blacklist a user from using Bridge.')
                .addUserOption(option =>
                    option
                        .setName('target')
                        .setDescription('The member to blacklist.')
                        .setRequired(true))

                .addStringOption(option =>
                    option.setName('offence')
                        .setDescription('The offence the user violated.')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Advertising inappropriate items', value: '1' },
                            { name: 'Advertising items that violates D.TOS / D.CG / D.DP', value: '2' },
                            { name: 'Using automation to gain an unfair advantage', value: '3' },
                            { name: 'Utilizing glitches to gain an unfair advantage', value: '4' },
                            { name: 'Advertising servers related to crypto currencies.', value: '5' },
                        )))

        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('Unblacklist a user from using Bridge.')
                .addUserOption(option =>
                    option
                        .setName('target')
                        .setDescription('The member to unblacklist.')
                        .setRequired(true))

                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('The reason for unblacklisting.')
                        .setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand.setName('check')
                .setDescription('Check a user\'s blacklist.')

                .addUserOption(option =>
                    option
                        .setName('target')
                        .setDescription('The member to blacklist.')
                        .setRequired(true))),
    DEVS: true,
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const target = interaction.options.getUser('target');
        switch (interaction.options.getSubcommand()) {
            case 'add': {
                const blacklistData = await blacklistSchema.findOne({ user: target.id });
                if (blacklistData) return await interaction.editReply({ embeds: [interaction.client.embed.errorEmbed(`**${target.tag}** is already blacklisted.`)], ephemeral: true });

                const offence = interaction.options.getString('offence');
                const offenceString = offenceStringList[offence - 1];

                const caseId = uuid();

                target.send({ embeds: [interaction.client.embed.errorEmbed(`You have been permanently **blacklisted** for __**${offenceString}**__\n\n\`Blacklist ID: ${caseId}\``)] })
                    .catch(async () => {
                        return await interaction.followUp({ embeds: [interaction.client.embed.errorEmbed(`Unable to notify **${target.tag}**`)], ephemeral: true });
                    });
                await interaction.editReply({ embeds: [interaction.client.embed.successEmbed(`**${target.tag}** has been permanently blacklisted for ${offenceString}.`)], ephemeral: true });
                await userSchema.deleteOne({ user: target.id });
                await new blacklistSchema({ id: caseId, user: target.id, moderator: interaction.user.id, offence: offenceString }).save();
                break;
            };
            case 'remove': {
                const blacklistData = await blacklistSchema.findOne({ user: target.id });
                if (!blacklistData) return await interaction.editReply({ embeds: [interaction.client.embed.errorEmbed(`**${target.tag}** is currently not blacklisted.`)], ephemeral: true });

                target.send({ embeds: [interaction.client.embed.successEmbed('You have been **unblacklisted** from using Bridge.')] })
                    .catch(async () => {
                        return await interaction.followUp({ embeds: [interaction.client.embed.errorEmbed(`Unable to notify ${target.tag}.`)], ephemeral: true });
                    });
                await interaction.editReply({ embeds: [interaction.client.embed.successEmbed(`**${target.tag}** has been unblacklisted.`)], ephemeral: true });
                await blacklistSchema.deleteOne({ user: target.id });
                break;
            };
            case 'check': {
                const blacklistData = await blacklistSchema.findOne({ user: target.id });
                if (!blacklistData) return await interaction.editReply({ embeds: [interaction.client.embed.errorEmbed(`**${target.tag}** is currently not blacklisted.`)], ephemeral: true });

                const embed = new EmbedBuilder()
                    .setTitle(`${target.tag}'s Blacklist`)
                    .addFields(
                        { name: 'Blacklist ID', value: `**\`${blacklistData.id}\`**` },
                        { name: 'User', value: `<@${target.id}> **\`(${target.id})\`**`, inline: true },
                        { name: 'Moderator', value: `<@${blacklistData.moderator}> **\`(${blacklistData.moderator})\`**`, inline: true },
                        { name: 'Offence', value: `${blacklistData.offence}`, inline: true },
                        { name: 'Blacklisted On', value: `<t:${blacklistData.date}:F>`, inline: true },
                    );

                await interaction.editReply({ embeds: [embed], ephemeral: true });
                break;
            };
        };
    },
};