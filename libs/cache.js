var redis       = require("redis");

var bluebird    = require("bluebird");

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

var client = redis.createClient();
client.on("error", function (err) {
    console.log("Redis Error " + err);
});

module.exports = {
    client: client,
    redis: redis
}