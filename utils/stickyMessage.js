const { ActionRowBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');

const stickyMessage = async (message) => {
    const userData = await message.client.database.fetchUser(message.author.id);
    const guilds = await message.client.database.fetchGuilds();

    guilds.forEach(async (guild) => {
        if (guild.guild === message.guild.id) return;
        const channel = message.client.channels.cache.get(guild.channel);
        const msgs = await channel.messages.fetch({ limit: 100 });

        msgs.filter(m => m.author.id === message.client.user.id).forEach(msg => {
            msg.delete();
        });
    
        const stickyEmbed = new EmbedBuilder()
            .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
            .setThumbnail(message.client.user.avatarURL())
            .setDescription(`Thanks for advertising through Bridge. Your advertisement has been sent to **${message.client.statistic.totalGuilds(message.client)} guilds** and **${message.client.statistic.memberData(message.client)} members**.\n\nBy advertising in any Bridge connected channel, you __acknowledge__ and __agree__ to our [**Terms of Service**](${config.links.termsOfService}) and [**Privacy Policy**](${config.links.privacyPolicy}).`)
            .setFooter({ text: 'Powered by Void Developments' })
            .setColor(userData.subscription.color)
            .setTimestamp();
    
        const addMeButton = message.client.button.buttonBuilder(null, 'Add Me!', 'link', 'https://discord.com/api/oauth2/authorize?client_id=1072798665749561365&permissions=535263837905&scope=bot%20applications.commands'),
            supportServerButton = message.client.button.buttonBuilder(null, 'Support Server', 'link', 'https://discord.gg/WDTcBRNVPB');
    
        const row = new ActionRowBuilder()
            .addComponents(addMeButton, supportServerButton);
    
        message.channel.send({ embeds: [stickyEmbed], components: [row] });
    })


};

module.exports = stickyMessage;