'use strict';
module.exports = function (sequelize, DataTypes) {
    const WeixinUser = sequelize.define('WeixinUser', {
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

    return WeixinUser;
};
