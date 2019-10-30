'use strict';
module.exports = function (sequelize, DataTypes) {
    const NetPayProduct = sequelize.define('NetPayProduct', {
        product_id: {
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
        product_type: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "产品类型：netpay-网络产品(网络套餐)，normal-优选商品(优选小卖部)"
        },
        logo_url: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "logo"
        },
        banner_imgs: {
            type: DataTypes.STRING,
            comment: "banner图"
        },
        poster_bg_url: {
            type: DataTypes.STRING,
            comment: "海报背景图"
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
        unit_name: {
            type: DataTypes.STRING,
            comment: "单位描述"
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
        base_price: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            comment: "底价"
        },
        mark_price: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            comment: "标价"
        },
        installation_fee: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            comment: "安装费"
        },
        optical_modem_deposit: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            comment: "光猫押金"
        },
        operator_cost: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            comment: "运营商成本"
        },
        owner_sharing: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            comment: "业主分成"
        },
    }, {
        tableName: 'netpay_products',
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
                NetPayProduct.hasMany(models.NetPayProductProject, {
                    as: "projects",
                    foreignKey: 'product_id'
                });
                NetPayProduct.belongsTo(models.NetPayDiscount, {
                    as: "discount",
                    foreignKey: 'discount_id'
                });
            }
        }
    });

    return NetPayProduct;
};
