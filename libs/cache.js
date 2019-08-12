var redis = require("redis");
var settings = require("../settings");

const asyncRedis = require("async-redis");

var bluebird = require("bluebird");
/**Promise化redis, 方法后添加async调用redis命令 */
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

var client = redis.createClient(settings.redis);
//var client = asyncRedis.decorate(redis.createClient(settings.redis));
client.on("error", function (err) {
    console.log("Redis Error " + err);
});

module.exports = {
    client: client,
    redis: redis,
    settings
}