var _ = require('lodash');
var moment = require("moment");
var Boom = require('boom');
var Guid = require('guid');
var weixin_api = require('../../../libs/weixin_api');
var Service = function (db) {
    this.db = db;
    this.include = [];
    this.attributes = ['wx_user_id', 'open_id', 'nickname', 'gender', 'language', 'city', 'province', 'country', 'avatar_url', 'union_id', 'mobile', 'remark', 'created_at', 'updated_at'];
};
//普通列表
Service.prototype.list = function (where, page_size, page_number, orderArr) {

    var options = {
        attributes: this.attributes,
        include: _.cloneDeep(this.include),
        where: where,
        order: orderArr
    };
    //如果分页参数中有一个等于0, 则获取全部数据
    if (page_size > 0 && page_number > 0) {
        options.limit = page_size;
        options.offset = page_size * (page_number - 1);
    }
    return this.db.WeixinUser.findAndCountAll(options)
};
//获取单项
Service.prototype.get = function (where) {

    var option = {
        where: where,
        attributes: this.attributes
    };

    return this.db.WeixinUser.findOne(option);
};
//创建
Service.prototype.create = function (data) {

    var self = this;

    return self.db.WeixinUser.build(data).save().then(result => {
        if (result) {
            result = JSON.parse(JSON.stringify(result))
            delete result.secret//删除secret后返回
        }

        return result
    });
};
//删除单个
Service.prototype.delete = function (where) {

    return this.db.WeixinUser.findOne({ where: where }).then(function (item) {
        if (item)
            return item.destroy();
        else
            return Boom.notFound("找不到指定标识的数据")
    });
};
//更新单个
Service.prototype.update = function (where, data) {
    return this.db.WeixinUser.update(data, { where: where });
};

Service.prototype.getSessionKey2 = async function (jscode) {
    let app_id = "wx33570046d866a526",
        app_secret = "b0124697b464fb06579789edb9f41951";

    return weixin_api.getSession_key(app_id, app_secret, jscode).then(function (result) {
        if (!result || result.errcode) {
            return Promise.reject(Boom.notFound('获取登录凭证失败，请稍后重试。'));
        }

        return result;
    })
}

Service.prototype.DecryptMimiAppUser2 = function (session_key, encrypted_data, iv) {

    var self = this;

    return weixin_api.DecryptMimiAppUser(session_key, encrypted_data, iv).then(function (result) {
        if (result.err) {
            return Promise.reject(Boom.notFound('获取用户信息失败。'));
        } else {
            console.log(JSON.stringify(result));
            let wxuser_result = {};

            if (result.openId) wxuser_result.open_id = result.openId;
            if (result.nickName) wxuser_result.nickname = result.nickName;
            if (result.gender) wxuser_result.gender = result.gender;
            if (result.language) wxuser_result.language = result.language;
            if (result.city) wxuser_result.city = result.city;
            if (result.province) wxuser_result.province = result.province;
            if (result.country) wxuser_result.country = result.country;
            if (result.avatarUrl) wxuser_result.avatar_url = result.avatarUrl;

            return self.db.WeixinUser.findOne({ where: { open_id: result.openId } }).then(item => {
                if (item) {
                    return item.update(wxuser_result).then(() => {
                        return self.db.WeixinUser.findOne({ where: { open_id: result.openId } })
                    })
                }
                else {
                    return self.db.WeixinUser.build(wxuser_result).save();
                }
            })
        }
    })
};

module.exports = Service;

