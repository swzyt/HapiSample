const restler = require('restler');
const _ = require('lodash');

var defaultOptions = {
    headers: {
        "content-type": "application/json"
    }
}
const mergeParams = (params) => {
    return _.merge(defaultOptions, params, function (dest, src) {
        if (_.isArray(dest) && _.isArray(src)) {
            return dest.concat(src);
        }
    });
}

const get = (url, params) => {
    let options = mergeParams(params);

    return new Promise((resolve, reject) => {
        restler.get(url, options)
            .on("success", function (result) {
                //console.log("请求成功：", result);
            })
            .on("fail", function (result) {
                //console.log("请求失败：", result);
                reject(result)
            })
            .on('complete', function (result) {
                if (!result) {
                    resolve(null)
                }
                if (result instanceof Error) {
                    reject(result)
                }

                resolve(result)
            })
    })
}
const post = (url, params) => {
    let options = mergeParams(params);

    return new Promise((resolve, reject) => {
        restler.post(url, options)
            .on("success", function (result) {
                //console.log("请求成功：", result);
            })
            .on("fail", function (result) {
                //console.log("请求失败：", result);
                reject(result)
            })
            .on('complete', function (result) {
                if (!result) {
                    resolve(null)
                }
                if (result instanceof Error) {
                    reject(result)
                }

                resolve(result)
            })
    })
}

module.exports = {
    get,
    post
}