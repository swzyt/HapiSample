'use strict';
module.exports = function (sequelize, DataTypes) {
    const NetPayOperator = sequelize.define('NetPayOperator', {
        operator_id: {
            type: DataTypes.INTEGER(14),
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            comment: "运营商名称"
        },
        line_number: {
            type: DataTypes.STRING,
            comment: "线路编号"
        },
        contact_name: {
            type: DataTypes.STRING,
            comment: "联系人名称"
        },
        contact_mobile: {
            type: DataTypes.STRING,
            comment: "联系人电话"
        },
        address: {
            type: DataTypes.STRING,
            comment: "地址"
        },
        description: {
            type: DataTypes.TEXT,
            comment: "描述"
        },
        valid: {
            type: DataTypes.BOOLEAN,
            comment: "是否有效"
        }
    }, {
        tableName: 'netpay_operators',
        indexes: [
        ],
        timestamps: true,
        underscored: true,
        hooks: {
            afterCreate: function (item, options) {
            }
        },
        classMethods: {
            associate: function (models) {
                
            }
        }
    });

    return NetPayOperator;
};
