const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
	user: String,

	settings: {
		notifications: { type: Boolean, default: true },
	},
	adsPosted: { type: Number, default: 0 },

	subscription: {
		'tier': { type: Number, default: 0 },
		'rank': { type: String, default: null },
		'color': { type: String, default: '#5865F2' }
	}
},
{
	timestamps: true,
});

module.exports = model('user', UserSchema);