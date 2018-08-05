var redis = require("redis")
var redis_client = redis.createClient("redis://localhost:6379/1");

redis_client.on('connect', () => {
    console.log('connected to redis');
});
redis_client.on('error', err => {
    console.log('Error:',err);
});

module.exports = redis_client