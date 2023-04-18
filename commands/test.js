const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Test.'),
    DEVS: true,
    async execute(interaction) {
    },
};