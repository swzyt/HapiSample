
const guid = require('guid'),
    cache = require('../cache.js'),
    token_key = 'TOKEN:';

module.exports = {
    getTokenGuid: function () {
        return guid.create().value;
    },
    setToken: async function (gid, data, expire_at) {
        let key = `${token_key}${gid}`;
        await cache.client.setAsync(key, JSON.stringify(data));
        await cache.client.pexpireatAsync(key, expire_at);
        return gid;
    },
    getToken: async function (gid) {
        let key = `${token_key}${gid}`;
        let redis_data = await cache.client.getAsync(key);

        if (redis_data)
            return JSON.parse(redis_data);

        return null;
    }
}