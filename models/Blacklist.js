const { Schema, model } = require('mongoose');

const BlacklistSchema = new Schema({
	id: String,

	user: String,
	moderator: String,
	offence: String,
	date: { type: Number, default: Date.now() },
});

module.exports = model('blacklist', BlacklistSchema);