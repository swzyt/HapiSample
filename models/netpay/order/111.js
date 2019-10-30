'use strict';
module.exports = function (sequelize, DataTypes) {
    const NetPayOrder = sequelize.define('NetPayOrder', {
        order_id: {
            type: DataTypes.INTEGER(14),
            autoIncrement: true,
            primaryKey: true
        },
        number: {
            type: DataTypes.STRING(100),
            unique: true,
            comment: "订单流水号"
        },
        wx_order_number: {
            type: DataTypes.STRING(100),
            unique: true,
            comment: "微信订单号"
        },
        wx_payment_at: {
            type: DataTypes.DATE,
            comment: "微信支付时间"
        },
        tenant_id: {
            type: DataTypes.INTEGER(14),
            comment: "租户id"
        },

        pay_status: {
            type: DataTypes.STRING(180),
            comment: "支付状态（待支付/支付中/已支付/已过期/已退款）"
        },
        total_amount: {
            comment: "总金额"
        },
        discount_amount: {
            comment: "优惠金额"
        },
        payed_amount: {
            comment: "实付金额"
        },
        real_price: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            comment: "实价"
        },
        count: {
            type: DataTypes.INTEGER(14),
            allowNull: false,
            comment: "数量"
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

        project_id: {},
        building_id: {},
        room_id: {},
        discount_id: {},

        net_status: {
            type: DataTypes.STRING(180),
            comment: "网络状态（待开通/已取消/已开通/已到期）"
        },
        net_begin_date: {
            type: DataTypes.DATE,
            comment: "网络开始时间"
        },
        net_end_date: {
            type: DataTypes.DATE,
            comment: "网络结束时间"
        },
        operator_id: {
            comment: "运营商id"
        },

        refund_net_status: {},
        refund_net_amount: {},

        refund_installation_status: {},
        refund_installation_amount: {},

        refund_optical_modem_deposit_status: {},
        refund_optical_modem_deposit_amount: {},

        remark: {
            type: DataTypes.TEXT,
            comment: '备注'
        },
    }, {
        tableName: 'netpay_orders',
        indexes: [
        ],
        timestamps: true,
        underscored: true,
        classMethods: {
            associate: function (models) {
            }
        }
    });

    return NetPayOrder;
};
