
module.exports = function (sequelize, DataTypes) {
  const SystemMenuButton = sequelize.define('SystemMenuButton', {
    menu_button_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: ""
    }
  }, {
      tableName: 'system_menu_buttons',
      timestamps: false,//自动添加时间戳createAt，updateAt
      underscored: true,
      classMethods: {
        associate: function (models) {
          //菜单表与菜单按钮子表进行外键关联, 指定外键名称, 否则自动生成, 不直观
          SystemMenuButton.belongsTo(models.SystemMenu, {
            as: "buttons",
            foreignKey: 'menu_id'
          });
          //按钮表与菜单按钮子表进行外键关联, 指定外键名称, 否则自动生成, 不直观
          SystemMenuButton.belongsTo(models.SystemButton, {
            as: "menus",
            foreignKey: 'button_id'
          });
        }
      }
    });

  return SystemMenuButton;
};
