const { Schema, model } = require('mongoose');

const GuildSchema = new Schema({
	guild: String,
	channel: String,
	invite: String,
	webhook: String,
	subscription: { type: Number, default: 0 },

	settings: {
		reception: { type: Boolean, default: true },
		transmission: { type: Boolean, default: false },
		displayInvite: { type: Boolean, default: false },
	},
});

module.exports = model('guild', GuildSchema);