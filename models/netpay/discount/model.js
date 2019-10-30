'use strict';
module.exports = function (sequelize, DataTypes) {
    const NetPayDiscount = sequelize.define('NetPayDiscount', {
        discount_id: {
            type: DataTypes.INTEGER(14),
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "标题"
        },
        discount_type: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "折扣类型：满减、满折、扣满单价"
        },
        begin_valid_time: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: "有效开始时间"
        },
        end_valid_time: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: "有效结束时间"
        },
        description: {
            type: DataTypes.TEXT,
            comment: "描述"
        },
        valid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            comment: "是否有效"
        },
        values: {
            type: DataTypes.TEXT,
            comment: "折扣详情，json格式"
        },
    }, {
        tableName: 'netpay_discounts',
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
                NetPayDiscount.hasMany(models.NetPayProduct, {
                    as: "products",
                    foreignKey: 'discount_id'
                });
            }
        }
    });

    return NetPayDiscount;
};
