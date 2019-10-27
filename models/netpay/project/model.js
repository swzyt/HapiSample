/**
 * Created by vincent on 16/7/26.
 */
'use strict';
module.exports = function (sequelize, DataTypes) {
    const NetPayProject = sequelize.define('NetPayProject', {
        project_id: {
            type: DataTypes.INTEGER(14),
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            comment: "标题"
        },
        alias: {
            type: DataTypes.STRING,
            comment: "别名"
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
        tableName: 'netpay_projects',
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
                NetPayProject.hasMany(models.NetPayBuilding, {
                    as: "buildings",
                    foreignKey: 'project_id'
                });
                NetPayProject.hasMany(models.NetPayRoom, {
                    as: "rooms",
                    foreignKey: 'project_id'
                });
            }
        }
    });

    return NetPayProject;
};
