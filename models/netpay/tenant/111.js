'use strict';
module.exports = function (sequelize, DataTypes) {
    const NetPayTenant = sequelize.define('NetPayTenant', {
        tenant_id: {
            type: DataTypes.INTEGER(14),
            autoIncrement: true,
            primaryKey: true
        },
        open_id: {
            type: DataTypes.STRING(100),
            unique: true,
            comment: "小程序open_id"
        },
        true_name: {
            type: DataTypes.STRING(180),
            comment: "真实姓名"
        },
        identity_type: {
            type: DataTypes.STRING(100),
            comment: '身份证类型'
        },
        identity_id: {
            type: DataTypes.STRING(100),
            comment: '身份证号'
        },
        status: {
            type: DataTypes.STRING(100),
            comment: "rent(在租)， no_rent(退租)"
        },
        mobile: {
            type: DataTypes.STRING(50),
            comment: "微信手机号"
        },
        net_begin_date: {
            type: DataTypes.DATE,
            comment: "网络开始时间"
        },
        net_end_date: {
            type: DataTypes.DATE,
            comment: "网络结束时间"
        },
        remark: {
            type: DataTypes.TEXT,
            comment: '备注'
        },
    }, {
        tableName: 'netpay_tenants',
        indexes: [
        ],
        timestamps: true,
        underscored: true,
        classMethods: {
            associate: function (models) {
            }
        }
    });

    return NetPayTenant;
};
