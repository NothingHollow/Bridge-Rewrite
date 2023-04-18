const Redis = require('ioredis');
const redisPool = new Map();

const createRedisClient = async () => {
	try {
		const redisClient = new Redis({
			port: process.env.REDIS_PORT,
			host: process.env.REDIS_HOST,
			username: 'default',
			password: process.env.REDIS_PASS,
			db: 0,
		});

		redisPool.set('redisClient', redisClient);
		return redisClient;
	}
	catch (err) {
		console.error(err);
	};
};

const getRedisClient = async () => {
	if (redisPool.has('redisClient')) {
		try {
			return redisPool.get('redisClient');
		} catch {
			return createRedisClient();
		}
	} else {
		return createRedisClient();
	}
}

module.exports = { createRedisClient, getRedisClient }