
module.exports = function (sequelize, DataTypes) {
  const ZoneUser = sequelize.define('ZoneUser', {
    user_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: "用户id"
    },
    user_login: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "登录名"
    },
    user_pass: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "密码"
    },
    user_nicename: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "昵称"
    },
    user_email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Email"
    },
    user_status: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "用户状态"
    },
    display_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "显示名称"
    },
  }, {
      tableName: 'zone_users',
      timestamps: true,//自动添加时间戳createAt，updateAt
      underscored: true,
      classMethods: {
        associate: function (models) {
        }
      }
    });

  return ZoneUser;
};
