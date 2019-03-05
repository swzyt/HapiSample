
module.exports = function (sequelize, DataTypes) {
  const SystemUser = sequelize.define('SystemUser', {
    user_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: "用户id"
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "名称"
    },
    description: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "描述"
    }
  }, {
      tableName: 'system_users',
      timestamps: true,
      underscored: true,
      classMethods: {
        associate: function (models) {
        }
      }
    });

  return SystemUser;
};
