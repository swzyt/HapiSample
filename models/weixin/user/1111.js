'use strict';
module.exports = function (sequelize, DataTypes) {
    const WeiXinUser = sequelize.define('WeiXinUser', {
        wx_user_id: {
            type: DataTypes.INTEGER(14),
            autoIncrement: true,
            primaryKey: true
        },
        open_id: {
            type: DataTypes.STRING(100),
            unique: true
        },
        nickname: {
            type: DataTypes.STRING(180)
        },
        gender: {
            type: DataTypes.INTEGER
        },
        language: {
            type: DataTypes.STRING(125)
        },
        city: {
            type: DataTypes.STRING(125)
        },
        province: {
            type: DataTypes.STRING(125)
        },
        country: {
            type: DataTypes.STRING(50)
        },
        avatar_url: {
            type: DataTypes.STRING(180)
        },
        union_id: {
            type: DataTypes.STRING(50),
            comment: "只有在用户将公众号绑定到微信开放平台帐号后，才会出现该字段"
        },
        mobile: {
            type: DataTypes.STRING(50),
            comment: "微信手机号"
        },
        remark: {
            type: DataTypes.STRING(180)
        },
    }, {
        tableName: 'weixin_users',
        indexes: [
            { name: 'nickname_index', fields: ['nickname'] },
        ],
        timestamps: true,
        underscored: true,
        classMethods: {
            associate: function (models) {
            }
        }
    });

    return WeiXinUser;
};
