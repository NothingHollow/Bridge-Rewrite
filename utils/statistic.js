const memberData = function(client) {
	const totalMembersCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
	return totalMembersCount;
};

const totalGuilds = function(client) {
	return client.guilds.cache.size;
};

module.exports = { memberData, totalGuilds };