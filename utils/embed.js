const { EmbedBuilder } = require('discord.js');

const errorEmbed = function(message) {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Error Encountered', iconURL: 'https://cdn.discordapp.com/emojis/1094225428283142194.webp?size=240&quality=lossless' })
        .setDescription(`${message}`)
        .addFields(
            { name: 'Support Server', value: 'Join [__**Bridge\'s Support Server**__](https://discord.gg/Fc4AGGQYgd**__) for further assistance.', inline: true },
            { name: 'Support Forum', value: 'Check out our __**Support Forum**__: <#1096877581111922699>.', inline: true }
        )
        .setColor('#ed4245')
        .setFooter({ text: 'Powered by Void Developments' })
        .setTimestamp();

    return embed;
};

const permsEmbed = function(perms) {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Permission Missing', iconURL: 'https://cdn.discordapp.com/emojis/1094225436533346394.webp?size=240&quality=lossless' })
        .setDescription(`${message}`)
        .addFields(
            { name: 'Support Server', value: 'Join [__**Bridge\'s Support Server**__](https://discord.gg/Fc4AGGQYgd**__) for further assistance.', inline: true },
            { name: 'Support Forum', value: 'Check out our __**Support Forum**__: <#1096877581111922699>.', inline: true }
        )
        .setColor('#f57531')
        .setFooter({ text: 'Powered by Void Developments' })
        .setTimestamp();

    return embed;
};

const expiredEmbed = function(message) {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Promot Expired', iconURL: 'https://cdn.discordapp.com/emojis/1094225433681211402.webp?size=240&quality=lossless' })
        .setDescription(`${message}`)
        .addFields(
            { name: 'Support Server', value: 'Join [__**Bridge\'s Support Server**__](https://discord.gg/Fc4AGGQYgd**__) for further assistance.', inline: true },
            { name: 'Support Forum', value: 'Check out our __**Support Forum**__: <#1096877581111922699>.', inline: true }
        )
        .setColor('#faa91a')
        .setFooter({ text: 'Powered by Void Developments' })
        .setTimestamp();

    return embed;
};


const successEmbed = function(message) {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Operation Successful', iconURL: 'https://cdn.discordapp.com/emojis/1094225430497726545.webp?size=240&quality=lossless' })
        .setDescription(`${message}`)
        .addFields(
            { name: 'Support Server', value: 'Join [__**Bridge\'s Support Server**__](https://discord.gg/Fc4AGGQYgd**__) for further assistance.', inline: true },
            { name: 'Support Forum', value: 'Check out our __**Support Forum**__: <#1096877581111922699>.', inline: true }
        )
        .setColor('#3ca55d')
        .setFooter({ text: 'Powered by Void Developments' })
        .setTimestamp();

    return embed;
};

module.exports = { errorEmbed, permsEmbed, expiredEmbed, successEmbed };