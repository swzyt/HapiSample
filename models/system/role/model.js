
module.exports = function (sequelize, DataTypes) {
  const SystemRole = sequelize.define('SystemRole', {
    role_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: "角色id"
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "名称"
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "描述"
    },
    valid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
      comment: "是否有效"
    }
  }, {
      tableName: 'system_roles',
      timestamps: true,//自动添加时间戳createAt，updateAt
      underscored: true,
      classMethods: {
        associate: function (models) {
          //角色表与权限表进行外键关联, 指定外键名称, 否则自动生成, 不直观
          SystemRole.hasMany(models.SystemRolePermission, {
            as: "role_permissions",
            foreignKey: 'role_id'
          });

          SystemRole.hasMany(models.SystemUserRole, {
            as: "users",
            foreignKey: 'role_id'
          });
        }
      }
    });

  return SystemRole;
};
