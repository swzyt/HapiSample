
module.exports = function (sequelize, DataTypes) {
  const SystemRolePermission = sequelize.define('SystemRolePermission', {
    role_permission_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: ""
    },
    permission_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "权限类型 menu/菜单, menu_button/菜单按钮, menu_field/菜单字段"
    },
    permission_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: "权限id menu/菜单/menu_id, menu_button/菜单按钮/menu_button_id, menu_field/菜单字段/menu_field"
    },
    permission_check_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "full/选中，half/半选中"
    },
  }, {
      tableName: 'system_role_permissions',
      timestamps: false,//自动添加时间戳createAt，updateAt
      underscored: true,
      classMethods: {
        associate: function (models) {
          //角色表与权限表进行外键关联, 指定外键名称, 否则自动生成, 不直观
          SystemRolePermission.belongsTo(models.SystemRole, {
            as: "role_permissions",
            foreignKey: 'role_id'
          });
        }
      }
    });

  return SystemRolePermission;
};
