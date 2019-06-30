
module.exports = function (sequelize, DataTypes) {
  const SystemUserRole = sequelize.define('SystemUserRole', {
    user_role_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: ""
    },
  }, {
      tableName: 'system_user_roles',
      timestamps: false,//自动添加时间戳createAt，updateAt
      underscored: true,
      classMethods: {
        associate: function (models) {

          SystemUserRole.belongsTo(models.SystemUser, {
            as: "roles",
            foreignKey: 'user_id'
          });

          SystemUserRole.belongsTo(models.SystemRole, {
            as: "users",
            foreignKey: 'role_id'
          });
        }
      }
    });

  return SystemUserRole;
};
