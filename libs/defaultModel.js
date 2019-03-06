/**
 * 业务表默认字段
 */

var moment = require("moment");

module.exports = function (sequelize, DataTypes) {
    let columnArr = ['app_id', 'created_time', 'create_user_id', 'create_user_name', 'updated_time', 'updated_user_id', 'updated_user_name'];

    let defaultModel = {
        app_id: {
            type: DataTypes.UUID,
            defaultValue: "",
            comment: '应用标识id'
        },
        /* created_at: {
            type: DataTypes.DATE(),
            defaultValue: Sequelize.NOW,
            comment: '创建时间',
            get() {
                return moment(this.getDataValue('created_time')).format('YYYY-MM-DD HH:mm:ss');
            }
        }, */
        create_user_id: {
            type: DataTypes.STRING(100),
            defaultValue: "",
            comment: '创建者标识'
        },
        create_user_name: {
            type: DataTypes.STRING(100),
            defaultValue: "",
            comment: '创建者显示名'
        },
        /* updated_at: {
            type: DataTypes.DATE(),
            defaultValue: Sequelize.NOW,
            comment: '修改时间',
            get() {
                return moment(this.getDataValue('updated_time')).format('YYYY-MM-DD HH:mm:ss');
            }
        }, */
        updated_user_id: {
            type: DataTypes.STRING(100),
            defaultValue: "",
            comment: '修改者'
        },
        updated_user_name: {
            type: DataTypes.STRING(100),
            defaultValue: "",
            comment: '修改者显示名'
        }
    };

    return { columnArr, defaultModel }
}