const restler = require('restler');

var options = {
    headers: {
        "content-type": "application/json"
    }
}


const get = (url) => {
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
const post = (url) => {
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