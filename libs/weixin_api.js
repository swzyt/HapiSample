/**
 * Created by livebean on 14-5-5.
 */
var client = require('restler');
var cache = require('./cache.js');
var crypto = require('crypto');
// var Promise = require("bluebird");
//58.251.61.149
// var wx_url = "58.251.61.149";
// var wx_url = "183.61.49.149";
var wx_url = "api.weixin.qq.com";

/**
 * 获取指定微信服务号的访问令牌
 * @param app_id
 * @param app_secret
 * @param isnew
 */
function getAccessToken(app_id, app_secret, isnew) {
    isnew = isnew || false;//深圳公司的先调原来的接口
    if (app_id == "wx8bb2007af00c3645" && app_secret == "8f70453672457439ed279cd7f9780419") {

        return new Promise(function (resolve, reject) {
            var key = app_id + "_" + app_secret;
            console.log(key);
            cache.client.get(key, function (err, token) {
                //token在缓存中
                console.log("333333333333333333333333333");
                if (token && !isnew) return resolve(token);
                //token已经过期
                var api_url = 'https://' + wx_url + '/cgi-bin/token?grant_type=client_credential&appid='
                    + app_id + '&secret=' + app_secret;
                //向微信服务起发起请求
                client.get(api_url).on('complete', function (result) {
                    if (result instanceof Error) return reject(false);
                    cache.client.set(key, result.access_token, function (err) {
                        cache.client.expire(key, result.expires_in - 300);
                    });
                    console.log("22222222222222222222222");
                    console.log(result);
                    return resolve(result.access_token);
                });
            });
        }).catch(function (err) {
            console.log(err)
            return false;
        });


        // return new Promise(function(resolve, reject) {
        //     let api_url = "http://szapi.vanke.com/api/v1/weixin/oauth/token?service_id=53c38552058ca3fb565c8d5f";
        //     if(isnew)
        //         api_url += "&forced_update=true";
        //     client.get(api_url).on('complete', function(result) {
        //         console.log("3333333333333333333333333333333333333333333333333333333333333");
        //         console.log(result);
        //         if (result instanceof Error) return reject(false);
        //         return resolve(result.data.access_token);
        //     });
        // }).catch(function(err){
        //         return false;
        //             });
    }
    // }else if(app_id=="wx57be893fb92b0832" && app_secret=="cdf205fb1e9f929b22f3d21478ec163d"){

    //     return new Promise(function(resolve, reject) {
    //         let api_url = "https://szapi2.vanke.com/weixin/v1/services/2/oauth/token";
    //         client.get(api_url).on('complete', function(result) {
    //             if (result instanceof Error) return reject(false);
    //             return resolve(result.data.access_token);
    //         });
    //     }).catch(function(err){
    //             return false;
    //                 });
    // }
    else {
        return new Promise(function (resolve, reject) {
            var key = app_id + "_" + app_secret;
            cache.client.get(key, function (err, token) {
                //token在缓存中
                if (token && !isnew) return resolve(token);
                //token已经过期
                var api_url = 'https://' + wx_url + '/cgi-bin/token?grant_type=client_credential&appid='
                    + app_id + '&secret=' + app_secret;
                //向微信服务起发起请求
                client.get(api_url).on('complete', function (result) {
                    if (result instanceof Error) return reject(false);
                    cache.client.set(key, result.access_token, function (err) {
                        cache.client.expire(key, result.expires_in - 300);
                    });
                    return resolve(result.access_token);
                });
            });
        }).catch(function (err) {
            return false;
        });
    }
}

/**
 * 获取指定微信服务号(小程序)的会话密钥
 * @param app_id
 * @param app_secret
 * @param jscode
 */
function getSession_key(app_id, app_secret, jscode) {
    var url = `https://${wx_url}/sns/jscode2session?appid=${app_id}&secret=${app_secret}&js_code=${jscode}&grant_type=authorization_code`;
    return new Promise((resolve, reject) => {
        client.get(url)
            .on("success", function (result) {
                // console.log("请求成功：", result);
            })
            .on("fail", function (result) {
                // console.log("请求失败：", result);
            })
            .on('complete', function (result) {
                console.log(result);
                if (result instanceof Error) {
                    return reject(false);
                }
                try {
                    result = JSON.parse(result);
                    resolve(result);
                } catch (ex) {
                    reject(false);
                }
            })
    });
}
/**
 * 解密指定微信服务号(小程序)的用户信息
 * @param app_id
 * @param session_key
 * @param encrypted_data
 * @param iv
 */
function DecryptMimiAppUser(session_key, encrypted_data, iv) {
    return new Promise(function (resolve, reject) {
        var sessionKey = new Buffer(session_key, 'base64');
        var encryptedData = new Buffer(encrypted_data, 'base64');
        iv = new Buffer(iv, 'base64');
        try {
            // 解密
            var decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv);
            // 设置自动 padding 为 true，删除填充补位
            decipher.setAutoPadding(true);
            var decoded = decipher.update(encryptedData, 'binary', 'utf8');
            decoded += decipher.final('utf8');
            decoded = JSON.parse(decoded);
            return resolve(decoded);
        } catch (err) {
            return reject(null);
        }
    });
}

/**
 * 获取指定微信服务号的粉丝信息
 * @param app_id
 * @param app_secret
 * @param open_id
 * @param cb
 */
function getUser(app_id, app_secret, open_id) {

    return getAccessToken(app_id, app_secret).then(function (access_token) {

        return new Promise(function (resolve, reject) {

            var url = 'https://' + wx_url + '/cgi-bin/user/info?access_token='
                + access_token + '&openid=' + open_id + '&lang=zh_CN';
            client.get(url, { encoding: "utf8mb4" }).on('complete', function (result) {

                if (result instanceof Error) return reject(false);
                resolve(result);
            })
        });

    });
}


/**
 * 获取指定微信服务号的粉丝信息
 * @param app_id
 * @param app_secret
 * @param next_openid
 * @returns {*|Promise}
 */
function getUsers(app_id, app_secret, next_openid) {

    return getAccessToken(app_id, app_secret).then(function (access_token) {

        return new Promise(function (resolve, reject) {

            var url = 'https://' + wx_url + '/cgi-bin/user/get?access_token='
                + access_token + '&next_openid=' + next_openid;
            client.get(url).on('complete', function (result) {

                if (result instanceof Error) return reject(false);
                resolve(result);
            })
        });

    });
}

/**
 * 获取指定微信服务号的群组信息
 * @param app_id
 * @param app_secret
 * @returns {*|Promise}
 */
function getGroups(app_id, app_secret) {

    return getAccessToken(app_id, app_secret).then(function (access_token) {

        return new Promise(function (resolve, reject) {

            var url = 'https://' + wx_url + '/cgi-bin/groups/get?access_token=' + access_token;
            client.get(url).on('complete', function (result) {

                if (result instanceof Error) return reject(false);
                resolve(result);
            })
        });

    });
}

/**
 * 自定义菜单查询接口
 * @param app_id
 * @param app_secret
 * @param code
 * @returns {*}
 */
function getButtons(app_id, app_secret) {
    return getAccessToken(app_id, app_secret).then(function (access_token) {
        return new Promise(function (resolve, reject) {
            var url = 'https://' + wx_url + '/cgi-bin/menu/get?access_token=' + access_token;
            client.get(url).on('complete', function (result) {
                if (result instanceof Error) return reject(false);
                resolve(result);
            })
        });

    });
}

/**
 * 自动回复消息查询接口
 * @param app_id
 * @param app_secret
 * @param code
 * @returns {*}
 */
function getReply(app_id, app_secret) {
    return getAccessToken(app_id, app_secret).then(function (access_token) {
        return new Promise(function (resolve, reject) {
            var url = 'https://' + wx_url + '/cgi-bin/get_current_autoreply_info?access_token=' + access_token;
            client.get(url).on('complete', function (result) {
                if (result instanceof Error) return reject(false);
                resolve(result);
            })
        });

    });
}

/**
 * 创建菜单信息
 * @param app_id
 * @param app_secret
 * @param buttons
 */
function postButtons(app_id, app_secret, buttons) {

    return getAccessToken(app_id, app_secret).then(function (access_token) {

        return new Promise(function (resolve, reject) {
            var url = 'https://' + wx_url + '/cgi-bin/menu/create?access_token=' + access_token;
            client.postJson(url, buttons).on('complete', function (result) {

                if (result instanceof Error) return reject(false);
                resolve(result);
            })
        });

    });
}

/**
 * 根据指定的验证code获取微信用户的openid
 * @param app_id
 * @param app_secret
 * @param code
 * @returns {*}
 */
function getOpenIdByCode(app_id, app_secret, code) {

    return new Promise(function (resolve, reject) {

        var url = 'https://' + wx_url + '/sns/oauth2/access_token?appid='
            + app_id + '&secret=' + app_secret + '&code=' + code + '&grant_type=authorization_code';

        client.get(url).on('complete', function (result) {

            if (result instanceof Error) return reject(false);
            resolve(result);
        })
    });
}

/**
 * 发送客户服务信息
 * @param app_id
 * @param app_secret
 * @param msgtype
 * @param messageBody
 * @returns {*}
 */
function sendCustomerMsg(app_id, app_secret, msgtype, messageBody) {

    return getAccessToken(app_id, app_secret).then(function (access_token) {

        return new Promise(function (resolve, reject) {

            var url = 'http://' + wx_url + '/cgi-bin/message/custom/send?access_token=' + access_token;

            client.postJson(url, messageBody).on('complete', function (result) {

                if (result instanceof Error) return reject(false);
                resolve(result);
            })
        });

    });
}

/**
 * 发送模板信息
 * @param app_id
 * @param app_secret
 * @param messageBody
 * @param cb
 */
function sendTemplateMsg(app_id, app_secret, messageBody, cb) {

    var _sel = this;
    _sel.getAccessToken(app_id, app_secret, function (err, access_token) {
        var api_url = 'https://' + wx_url + '/cgi-bin/message/template/send?access_token=' + access_token;
        //向微信服务起发起请求
        client.postJson(api_url, messageBody).on('complete', function (result) {
            if (result instanceof Error) {
                this.retry(5000); // try again after 5 sec
            } else {
                //无效token
                if (result.errcode == 40001) {
                    conditions.forced_update = true;
                    _sel.getAccessToken(conditions, function (err, access_token_new) {
                        api_url = 'https://' + wx_url + '/cgi-bin/message/template/send?access_token=' + access_token_new;
                        //向微信服务起发起请求
                        client.postJson(api_url, body).on('complete', function (result_new) {
                            if (result_new instanceof Error) {
                                cb(result_new, null);
                            } else {
                                cb(null, result_new);
                            }
                        });
                    });
                }
                else {
                    cb(null, result);
                }
            }
        });
    });
}

/**
 * 长链接转短链接
 * @param service_id
 * @param longurl  长链接
 * @param cb
 */
function long2shortUrl(app_id, app_secret, longurl, cb) {
    var _sel = this;
    var conditions = {
        service_id: service_id,
        forced_update: false
    };
    var msgbody = {
        action: "long2short",
        long_url: longurl
    };
    _sel.getAccessToken(conditions, function (err, access_token) {
        var api_url = 'https://' + wx_url + '/cgi-bin/shorturl?access_token=' + access_token;
        //向微信服务起发起请求
        client.postJson(api_url, msgbody).on('complete', function (result) {
            if (result instanceof Error) {
                console.log('Error:', result.errmsg);
                this.retry(5000); // try again after 5 sec
            } else {
                //无效token
                if (result.errcode == 40001) {
                    conditions.forced_update = true;
                    _sel.getAccessToken(conditions, function (err, access_token_new) {
                        api_url = 'https://' + wx_url + '/cgi-bin/shorturl?access_token=' + access_token_new;
                        //向微信服务起发起请求
                        client.postJson(api_url, msgbody).on('complete', function (result_new) {
                            if (result_new instanceof Error) {
                                console.log('Error:', result_new.errmsg);
                            } else {
                                cb(null, result);
                            }
                        });
                    });
                }
                else
                    cb(null, result);
            }
        });
    });
}

/**
 * 长链接转短链接
 * @param longurl  长链接
 * @param cb
 */
function long2shortUrl2(longurl, cb) {
    var api_url = 'http://dwz.cn/create.php';
    var msgbody = { "url": longurl };
    //向微信服务起发起请求
    client.post(api_url, { data: msgbody }).on('complete', function (result) {
        if (result instanceof Error) {
            console.log('Error:', result.errmsg);
            this.retry(5000); // try again after 5 sec
        } else {
            //cb(null, result);
            try {
                result = eval("(" + result + ")");
                cb(null, result);
            }
            catch (e) {
                cb("error", null);
            }
        }
    });
}

module.exports = {
    getAccessToken: getAccessToken,
    getSession_key: getSession_key,
    DecryptMimiAppUser: DecryptMimiAppUser,
    getUsers: getUsers,
    getUser: getUser,
    getGroups: getGroups,
    getReply: getReply,
    getButtons: getButtons,
    postButtons: postButtons,
    getOpenIdByCode: getOpenIdByCode,
    sendCustomerMsg: sendCustomerMsg,
    sendTemplateMsg: sendTemplateMsg,
    long2shortUrl: long2shortUrl,
    long2shortUrl2: long2shortUrl2,
};


