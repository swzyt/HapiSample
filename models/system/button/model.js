
module.exports = function (sequelize, DataTypes) {
  const SystemButton = sequelize.define('SystemButton', {
    button_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: "按钮id"
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "名称"
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "编码"
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
      tableName: 'system_buttons',
      timestamps: true,//自动添加时间戳createAt，updateAt
      underscored: true,
      classMethods: {
        associate: function (models) {
          //菜单表与菜单按钮子表进行外键关联, 指定外键名称, 否则自动生成, 不直观
          SystemButton.hasMany(models.SystemMenuButton, {
            as: "menus",
            foreignKey: 'button_id'
          });
        }
      }
    });

  return SystemButton;
};
