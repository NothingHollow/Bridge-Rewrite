const userSchema = require('../models/User');
const guildSchema = require('../models/Guild');

const fetchUser = async function(user) {
    const userData = await userSchema.findOne({ user: user });
    if (userData) {
        return userData;
    } else {
        var newUser = new userSchema({ user: user }).save();
        return newUser;
    };
};

const fetchUsers = async function() {
    const users = await userSchema.find();
    if (users) {
        return users;
    } else {
        return;
    };
};

const fetchGuild = async function(guild) {
    const guildData = await guildSchema.findOne({ guild: guild });
    if (guildData) {
        return guildData;
    } else {
        //var newGuild = new guildSchema({ guild: guild }).save();
        //return newGuild;
        return;
    };
};

const fetchGuilds = async function() {
    const guilds = await guildSchema.find();
    if (guilds) {
        return guilds;
    } else {
        return;
    };
};

module.exports = { fetchUser, fetchUsers, fetchGuild, fetchGuilds };