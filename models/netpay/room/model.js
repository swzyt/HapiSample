/**
 * Created by vincent on 16/7/27.
 */
'use strict';
module.exports = function (sequelize, DataTypes) {
    const NetPayRoom = sequelize.define('NetPayRoom', {
        room_id: {
            type: DataTypes.INTEGER(14),
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(50)
        },
        full_name: {
            type: DataTypes.STRING(180)
        },
        floor: {
            type: DataTypes.STRING,
            comment: "所属楼层"
        },
        unit: {
            type: DataTypes.STRING,
            comment: "所属单元"
        },
        valid: {
            type: DataTypes.BOOLEAN,
            comment: "是否有效"
        }
    }, {
        tableName: 'netpay_rooms',
        indexes: [
            { name: 'full_name_index', fields: ['full_name'] }
        ],
        timestamps: true,
        underscored: true,
        hooks: {
            afterCreate: function (item, options) {
            }
        },
        classMethods: {
            associate: function (models) {
                NetPayRoom.belongsTo(models.NetPayProject, {
                    as: "project",
                    foreignKey: 'project_id'
                });
                NetPayRoom.belongsTo(models.NetPayBuilding, {
                    as: "building",
                    foreignKey: 'building_id'
                });
            }
        }
    });

    return NetPayRoom;
};
