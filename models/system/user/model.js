
module.exports = function (sequelize, DataTypes) {
  const SystemUser = sequelize.define('SystemUser', {
    user_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: "用户id"
    },
    account: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "账号"
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "名称"
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "邮箱"
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "密码"
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
      tableName: 'system_users',
      timestamps: true,//自动添加时间戳createAt，updateAt
      underscored: true,
      classMethods: {
        associate: function (models) {
          SystemUser.hasMany(models.SystemUserRole, {
            as: "roles",
            foreignKey: 'user_id'
          });
        }
      }
    });

  return SystemUser;
};
