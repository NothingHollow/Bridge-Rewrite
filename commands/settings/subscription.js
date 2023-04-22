const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const subscriptions = require('../../assets/subscriptions.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('subscription')
        .setDescription('Upgrade a guild/user\'s subscription status.')

        .addSubcommand(subcommand =>
            subcommand
                .setName('guild')
                .setDescription('Edit a guild\'s subscription status.')

                .addStringOption(option => option
                    .setName('id')
                    .setDescription('The guild\'s ID.')
                    .setRequired(true))

                .addStringOption(option => option
                    .setName('guild_tier')
                    .setDescription('The status of the subscription to change to.')
                    .addChoices(
                        { name: 'Basic', value: '0' },
                        { name: 'Premium', value: '1' },
                    )
                    .setRequired(true)))


        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('Edit a user\'s subscription status.')

                .addStringOption(option => option
                    .setName('id')
                    .setDescription('The user\'s ID.')
                    .setRequired(true))

                .addStringOption(option => option
                    .setName('user_tier')
                    .setDescription('The status of the subscription to change to.')
                    .addChoices(
                        { name: 'Basic', value: '0' },
                        { name: 'Deluxe', value: '1' },
                        { name: 'Max', value: '2' },
                    )
                    .setRequired(true))),
    DEVS: true,
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const id = interaction.options.getString('id');

        switch (interaction.options.getSubcommand()) {
            case 'guild': {
                const guild = interaction.client.guilds.cache.get(id);
                if (!guild) return await interaction.editReply({ embeds: [interaction.client.embed.errorEmbed(`Guild with ID **\`${id}\`** doesn\'t exist.`)], ephemeral: true });
                const guildOwner = await guild.fetchOwner();

                const guildData = await interaction.client.database.fetchGuild(id);
                if (!guildData) return await interaction.editReply({ embeds: [interaction.client.embed.errorEmbed(`Unable to locate guild with ID **\`${id}\`** in the database.`)], ephemeral: true });

                const tier = new Number(interaction.options.getString('guild_tier'));
                if (guildData.subscription === tier.valueOf()) return await interaction.editReply({ embeds: [interaction.client.embed.errorEmbed(`Subscription tier is already **\`${Object.keys(subscriptions.guild)[tier].toUpperCase()}\`**.`)], ephemeral: true });

                await guildOwner.send({ embeds: [interaction.client.embed.successEmbed(`Your subscription tier for **${guild.name}** has been changed from **\`${Object.keys(subscriptions.guild)[guildData.subscription].toString().toUpperCase()}\`** to **\`${Object.keys(subscriptions.guild)[tier].toUpperCase()}\`**.`)], ephemeral: true })
                await interaction.editReply({ embeds: [interaction.client.embed.successEmbed(`Subscription tier changed from **\`${Object.keys(subscriptions.guild)[guildData.subscription].toUpperCase()}\`** to **\`${Object.keys(subscriptions.guild)[tier].toUpperCase()}\`**.`)], ephemeral: true });

                await guildData.updateOne({ subscription: tier });
                break;
            };
            case 'user': {
                const user = interaction.client.users.cache.get(id);

                const userData = await interaction.client.database.fetchUser(id);
                if (!userData) return interaction.editReply({ embeds: [interaction.client.embed.errorEmbed(`Unable to locate user with ID **\`${id}\`** in the database.`)], ephemeral: true });

                const tier = new Number(interaction.options.getString('user_tier'));
                if (userData.subscription.tier === tier.valueOf()) return await interaction.editReply({ embeds: [interaction.client.embed.errorEmbed(`Subscription tier is already **\`${Object.keys(subscriptions.user)[tier].toUpperCase()}\`**.`)], ephemeral: true });

                await user.send({ embeds: [interaction.client.embed.successEmbed(`Your subscription tier has been changed from **\`${Object.keys(subscriptions.user)[userData.subscription.tier].toUpperCase()}\`** to **\`${Object.keys(subscriptions.user)[tier].toUpperCase()}\`**.`)] });
                await interaction.editReply({ embeds: [interaction.client.embed.successEmbed(`Subscription tier changed from **\`${Object.keys(subscriptions.user)[userData.subscription.tier].toUpperCase()}\`** to **\`${Object.keys(subscriptions.user)[tier].toUpperCase()}\`**.`)], ephemeral: true });

                await userData.updateOne({ subscription: { tier: tier } });
                break;
            }
        };
    },
};