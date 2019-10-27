/**
 * Created by vincent on 16/7/27.
 */
'use strict';
module.exports = function (sequelize, DataTypes) {
    const NetPayBuilding = sequelize.define('NetPayBuilding', {
        building_id: {
            type: DataTypes.INTEGER(14),
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "标题"
        },
        alias: {
            type: DataTypes.STRING,
            comment: "别名"
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
        tableName: 'netpay_buildings',
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
                NetPayBuilding.belongsTo(models.NetPayProject, {
                    as: "project",
                    foreignKey: 'project_id'
                });
                NetPayBuilding.hasMany(models.NetPayRoom, {
                    as: "rooms",
                    foreignKey: 'building_id'
                });
            }
        },
        instanceMethods: {

        }
    });

    return NetPayBuilding;
};
